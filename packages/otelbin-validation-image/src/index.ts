import { realpath, writeFile } from "fs/promises";
import { spawn } from "child_process";
import spawnAsync from "@expo/spawn-async";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as yaml from "js-yaml";

interface SpawnError extends Error {
	pid: number;
	stdout: string;
	stderr: string;
	status: number;
	signal: string;
}

interface ValidationPayload {
	config: string;
	env: Env;
}

interface Env {
	[key: string]: string;
}

const distroName = process.env.DISTRO_NAME;

export const validateAdot = async (otelcolRealPath: string, configPath: string, env: Env): Promise<void> => {
	/*
	 * ADOT does not support the `validate` subcommand
	 * (see https://github.com/aws-observability/aws-otel-collector/issues/2391),
	 * so we need to fire up the collector an scan for a known log line that
	 * signifies succesful bootstrap.
	 */
	let resolveFn: Function, rejectFn: Function;

	const res = new Promise<void>((resolve, reject) => {
		resolveFn = resolve;
		rejectFn = reject;
	});
	let isResolved = false;

	/*
	 * Node.js spawn is unreliable in terms of collecting stdout and stderr through the spawn call
	 * (see https://github.com/nodejs/node/issues/19218). Getting a shell around the otelcol binary
	 * increases the reliability.
	 */
	const otelcol = spawn("/bin/sh", ["-c", `${otelcolRealPath} --config=${configPath}`], {
		env: {
			...process.env, // Ensure $PATH, terminal env vars and other basic niceties are set
			...env
		}
	});

	let stdout = "";
	let stderr = "";

	otelcol.stdout.on("data", (data) => {
		stdout += data.toString();
	});

	otelcol.stderr.on("data", (data) => {
		/*
		 * If the configuration is valid, the ADOT collector outputs to stderr:
		 * `Everything is ready. Begin running and processing data.`
		 */
		stderr += data.toString();

		if (stderr.includes("Everything is ready. Begin running and processing data.")) {
			resolveFn();
		}
	});

	otelcol.on("close", (code) => {
		if (!isResolved) {
			if (code===0) {
				resolveFn();
			} else {
				const err = new Error(`The '${otelcolRealPath}' exited with status '${code}'`) as SpawnError;
				err.status = code || -1;
				err.stdout = stdout;
				err.stderr = stderr;

				rejectFn(err);
			}
		}
	});

	return res
		.finally(() => {
			isResolved = true;
		})
		.finally(() => {
			// Kill process, we got what we needed
			otelcol.kill();
		});
};

export const validateOtelCol = async (otelcolRealPath: string, configPath: string, env: Env): Promise<void> => {
	/*
	 * Node.js spawn is unreliable in terms of collecting stdout and stderr through the spawn call
	 * (see https://github.com/nodejs/node/issues/19218). Getting a shell around the otelcol binary
	 * increases the reliability.
	 */
	await spawnAsync("/bin/sh", ["-c", `${otelcolRealPath} validate --config=${configPath}`], {
		ignoreStdio: false,
		detached: false,
		stdio: "pipe",
		timeout: 10_000
	});
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
	let body = event.body!;

	if (event.isBase64Encoded) {
		let buff = Buffer.from(body, "base64");
		body = buff.toString("ascii");
	}

	const validationPayload = JSON.parse(body) as ValidationPayload;
	const config = validationPayload.config;
	const env = validationPayload.env;

	if (
		!validationPayload || // Empty event
		!config || // Empty configuration string
		!config?.trim().length || // Blank configuration string (only whitespaces)
		!Object.keys(yaml.load(config) as Object).length // Empty YAML
	) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "The provided configuration is invalid",
				error: "the provided configuration is empty"
			})
		};
	}

	try {
		const configPath = "/tmp/config.yaml";

		await writeFile(configPath, config!, {
			flag: "w+"
		});

		// Resolve real path (the collector binary is likely symlinked)
		const otelcolRealPath = await realpath("/usr/bin/otelcol");

		switch (distroName) {
			case "adot":
				await validateAdot(otelcolRealPath, configPath, env);
				break;
			default:
				await validateOtelCol(otelcolRealPath, configPath, env);
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Configuration is valid"
			})
		};
	} catch (err) {
		console.error(err); // should contain code (exit code) and signal (that caused the termination).

		const spawnErr = err as SpawnError;

		const status = spawnErr.status;
		const stderr = spawnErr.stderr || "";
		const stdout = spawnErr.stdout || "";

		if (isCollectorValidationFailure(stderr)) {
			const error = extractErrorMessage(stderr);
			const path = extractErrorPath(error);

			return {
				statusCode: 200,
				// Unfortunately the collector returns one validation error at the time
				body: JSON.stringify({
					path,
					message: "The provided configuration is invalid",
					error
				})
			};
		}

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: `Error occurred while validating the configuration:\nstatus: ${status}\nstdout: ${stdout}\nstderr: ${stderr}\nerror: ${err}`
			})
		};
	}
};

const defaultErrorPrefix = "Error: ";
const adotInvalidConfigPrefix = "Error: invalid configuration: ";

function isCollectorValidationFailure(error: string): boolean {
	return error.includes(defaultErrorPrefix) || error.includes(adotInvalidConfigPrefix);
}

const parsingErrorHint = 'failed to get config:';

export function extractErrorMessage(error: string): string {
	let errorMessage: string;
	if (error.includes(parsingErrorHint)) {
		errorMessage = extractParsingErrorMessage(error);
	} else {
		errorMessage =  extractValidationErrorMessage(error);
	}

	// fall back to the full error in case we cannot parse the error message
	return errorMessage || error;
}

function extractParsingErrorMessage(error: string): string {
	const lines = new Set<string>();

	error
		.split("\n")
		.map(line => line.trim())
		.filter(line => line.startsWith('* '))
		.map(line => line.substring(2).trim())
		.filter(line => line?.length > 0)
		.forEach(line => lines.add(line));

	return Array.from(lines.values()).join("; ")
}

function extractValidationErrorMessage(error: string): string {
	return error
		.split('\n')
		.map(line => line.trim())
		.filter(line => line.startsWith(defaultErrorPrefix) || line.startsWith(adotInvalidConfigPrefix))
		.map(line => {
			if (line.startsWith(adotInvalidConfigPrefix)) {
				return line.substring(adotInvalidConfigPrefix.length).trim();
			}
			return line.substring(defaultErrorPrefix.length).trim();
		})
		[0];
}

export function extractErrorPath(errorMessage: string): string[] {
	return errorMessage.match(/^((?:[\w/]+(?:::)?)+):[^:]/)?.[1].split("::");
}
