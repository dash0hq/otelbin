/*
 * Jest-based integration tests
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, jest, test } from '@jest/globals';
import axios from 'axios';
import { resolveMaxReleasesPerDistribution } from '../src/distributions';
import { buildTestMatrix } from '../src/test-matrix';

interface Env {
  [key: string]: string;
}

const apiUrl = process.env.API_GATEWAY_URL?.replace(/[\/\\]+$/, '');
const apiKey = process.env.VALIDATION_API_KEY;

if (!apiUrl) {
  throw new Error("Required environment variable 'API_GATEWAY_URL' is missing");
}

if (!apiKey) {
  throw new Error("Required environment variable 'VALIDATION_API_KEY' is missing");
}

const enumerateTestCases = () => {
  if (process.env.RELEASE_UNDER_TEST) {
    const [distributionName, release] = process.env.RELEASE_UNDER_TEST.split('/');

    console.log(`Testing only distribution '${distributionName}', release '${release}'`);
    return [[distributionName, release]];
  }

  // Same list the `run-itests` matrix is built from, so a local run against a capped
  // environment does not try releases that environment never deployed.
  return buildTestMatrix(resolveMaxReleasesPerDistribution()).map(entry => entry.split('/'));
};

const assetFolderPath = join(__dirname, 'assets');

const prepareValidationPayload = (testConfigFilename: string, env?: Env) => JSON.stringify({
  config: readFileSync(join(assetFolderPath, testConfigFilename)).toString(),
  env,
});

const defaultTimeout = 10_000; // 10 seconds

const otelcolConfigValid = prepareValidationPayload('config-default.yaml');
/*
 * Deliberately a configuration that only validates once the environment is applied: its
 * exporter endpoint is nothing but `${OTLP_ENDPOINT}`, so a collector that does not receive
 * the variable expands it to the empty string and rejects the configuration. Validating
 * `config-default.yaml` here instead would pass either way and catch nothing.
 */
const otelcolConfigValidEnvInterpolation = prepareValidationPayload('config-env-interpolation.yaml', {
  OTLP_ENDPOINT: 'otelcol:4317',
});
const otelcolConfigEnvInterpolationWithoutEnv = prepareValidationPayload('config-env-interpolation.yaml');
const otelcolConfigInvalidNoReceivers = prepareValidationPayload('config-no-receivers.yaml');
const otelcolConfigInvalidUndeclaredExtension = prepareValidationPayload('config-undeclared-extension.yaml');
const otelcolConfigInvalidUndeclaredReceiver = prepareValidationPayload('config-undeclared-receiver.yaml');
const otelcolConfigInvalidUndeclaredReceiverNamedPipeline = prepareValidationPayload('config-undeclared-receiver-named-pipelines.yaml');

describe.each(enumerateTestCases())('Validation API', (distributionName, release) => {

  jest.retryTimes(5);

  const validationReleasePath = `validation/${distributionName}/${release}`;
  const validationUrl = `${apiUrl}/${validationReleasePath}`;

  const supportedDistributionsPath = 'validation/supported-distributions';
  const supportedDistributionsUrl = `${apiUrl}/${supportedDistributionsPath}`;

  describe(`for release ${distributionName}/${release}`, () => {

    describe(`GET ${supportedDistributionsPath}`, () => {

      test(`has data about ${distributionName}/${release}`, async () => {
        const res = await axios.get(supportedDistributionsUrl, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        });

        const distro = res.data[distributionName];

        expect(distro).toMatchObject({
          provider: expect.any(String),
          description: expect.any(String),
          website: expect.any(String),
          releases: expect.arrayContaining([
            expect.objectContaining({
              version: release,
            }),
          ]),
        });
      }, defaultTimeout);

    });

    describe(`POST ${validationReleasePath}`, () => {

      axios.defaults.baseURL = validationUrl;

      test('rejects unauthenticated requests', async () => {
        await expect(axios.post(validationUrl, otelcolConfigValid)).rejects.toThrow();
      }, defaultTimeout);

      test('accepts valid configuration', async () => {
        await expect(axios.post(validationUrl, otelcolConfigValid, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            message: 'Configuration is valid',
          },
        });
      }, defaultTimeout);

      test('accepts valid configuration with env var interpolation', async () => {
        await expect(axios.post(validationUrl, otelcolConfigValidEnvInterpolation, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            message: 'Configuration is valid',
          },
        });
      }, defaultTimeout);

      test('rejects a configuration whose env var interpolation has no environment to resolve against', async () => {
        await expect(axios.post(validationUrl, otelcolConfigEnvInterpolationWithoutEnv, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            message: 'The provided configuration is invalid',
          },
        });
      }, defaultTimeout);

      test('rejects empty validation payload', async () => {
        await expect(axios.post(validationUrl, '{}', {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            message: 'The provided configuration is invalid',
            error: 'the provided configuration is empty',
          },
        });
      }, defaultTimeout);

      test('rejects empty configuration', async () => {
        await expect(axios.post(validationUrl, '{"config":"", env: {"foo":"bar"}}', {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            message: 'The provided configuration is invalid',
            error: 'the provided configuration is empty',
          },
        });
      }, defaultTimeout);

      test('rejects configuration without declared receivers', async () => {
        await expect(axios.post(validationUrl, otelcolConfigInvalidNoReceivers, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            message: 'The provided configuration is invalid',
            error: 'no receiver configuration specified in config',
          },
        });
      }, defaultTimeout);

      test('rejects configuration with undeclared receiver', async () => {
        await expect(axios.post(validationUrl, otelcolConfigInvalidUndeclaredReceiver, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            path: ['service', 'pipelines', 'traces'],
            message: 'The provided configuration is invalid',
            error: 'service::pipelines::traces: references receiver "jaeger" which is not configured',
          },
        });
      }, defaultTimeout);

      test('rejects configuration with undeclared receiver in named pipeline', async () => {
        await expect(axios.post(validationUrl, otelcolConfigInvalidUndeclaredReceiverNamedPipeline, {
          headers: {
            'Content-Type': 'application/yaml',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            path: ['service', 'pipelines', 'traces/dash0'],
            message: 'The provided configuration is invalid',
            error: 'service::pipelines::traces/dash0: references receiver "jaeger" which is not configured',
          },
        });
      }, defaultTimeout);

      test('rejects configuration with undeclared extension', async () => {
        await expect(axios.post(validationUrl, otelcolConfigInvalidUndeclaredExtension, {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
        })).resolves.toMatchObject({
          status: 200,
          data: {
            path: ['service', 'extensions'],
            message: 'The provided configuration is invalid',
            error: 'service::extensions: references extension "health_check" which is not configured',
          },
        });
      }, defaultTimeout);

    });

  });

});