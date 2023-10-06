import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import spawnAsync from '@expo/spawn-async';
import { realpath, writeFile } from 'fs/promises';

interface SpawnError extends Error {
    pid: number;
    stdout: string;
    stderr: string;
    status: number;
    signal: string;
}

export const validate = async (configuration: string): Promise<void> => {
    const configPath = '/tmp/config.yaml';

    await writeFile(configPath, configuration!, {
        flag: 'w+',
    });

    // Resolve real path (the collector binary is likely symlinked)
    const otelcolRealPath = await realpath('/usr/bin/otelcol');

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
        await validate(config);

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