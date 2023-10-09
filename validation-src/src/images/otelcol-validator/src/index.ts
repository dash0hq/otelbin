import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { spawn } from 'node:child_process';
import spawnAsync from '@expo/spawn-async';
import { realpath, writeFile } from 'fs/promises';

interface SpawnError extends Error {
    pid: number;
    stdout: string;
    stderr: string;
    status: number;
    signal: string;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISTRO_NAME: string;
        }
    }
}

const distroName = process.env.DISTRO_NAME;

export const validateAdot = async (otelcolRealPath: string, configPath: string): Promise<void> => {
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

    const otelcol = spawn(otelcolRealPath, [`--config=${configPath}`]);

    let stdout = '', stderr = '';

    otelcol.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    otelcol.stderr.on('data', (data) => {
        /*
         * If the configuration is valid, the ADOT collector outputs to stderr:
         * `Everything is ready. Begin running and processing data.`
         */
        stderr += data.toString();

        if (stderr.includes('Everything is ready. Begin running and processing data.')) {
            resolveFn();
        }
    });

    otelcol.on('close', (code) => {
        if (!isResolved) {
            if (code === 0) {
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
        }).finally(() => {
            // Kill process, we got what we needed
            otelcol.kill();
        });
}

export const validateOtelCol = async (otelcolRealPath: string, configPath: string): Promise<void> => {
    await spawnAsync(otelcolRealPath, ['validate', `--config=${configPath}`], {
        ignoreStdio: false,
        detached: false,
        stdio: 'pipe',
        timeout: 10_000,
    });
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const config = event.body;

    if (!config) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: 'Empty configuration in request body',
            }),
        };
    }

    try {
        const configPath = '/tmp/config.yaml';

        await writeFile(configPath, config!, {
            flag: 'w+',
        });
    
        // Resolve real path (the collector binary is likely symlinked)
        const otelcolRealPath = await realpath('/usr/bin/otelcol');
    
        switch(distroName) {
            case 'adot':
                await validateAdot(otelcolRealPath, config);
                break;
            default:
                await validateOtelCol(otelcolRealPath, config);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Configuration is valid',
            }),
        };
    } catch (err) {
        console.error(err); // should contain code (exit code) and signal (that caused the termination).

        const spawnErr = err as SpawnError;

        const status = spawnErr.status;
        const stderr = spawnErr.stderr || '';
        const stdout = spawnErr.stdout || ''; 

        if (stderr.startsWith('Error:')) {
            const lines = stderr.split('\n');
            return {
                statusCode: 401,
                // Unfortunately the collector returns one validation error at the time
                body: JSON.stringify({
                    message: lines[0],
                }),
            }
        }
    
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error occurred while validating the configuration:\nstatus: ${status}\nstdout: ${stdout}\nstderr: ${stderr}\nerror: ${err}`,
            }),
        }
    }
};