/*
 * Jest-based integration tests
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, test } from '@jest/globals';
import axios from 'axios';
import { Distributions } from '../src/main';

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

  const distributions = JSON.parse(
	  (readFileSync(join(__dirname, '..', 'src', 'assets', 'supported-distributions.json'))).toString(),
  ) as Distributions;

  const testCases = new Array<string[]>();
  	for (let distributionName of Object.keys(distributions)) {
    	const distribution = distributions[distributionName];

	    for (let { version } of distribution.releases) {
    	  testCases.push([distributionName, version]);
    	}
  	}

  return testCases;
};

const assetFolderPath = join(__dirname, 'assets');

describe.each(enumerateTestCases())('Validation API', (distributionName, release) => {

  const validationReleasePath = `validation/${distributionName}/${release}`;
  const validationUrl = `${apiUrl}/${validationReleasePath}`;

  const otelcolConfigValid = readFileSync(join(assetFolderPath, 'config-default.yaml')).toString();

  const otelcolConfigInvalidNoReceivers = readFileSync(join(assetFolderPath, 'config-no-receivers.yaml')).toString();

  const otelcolConfigInvalidUndeclaredExtension = readFileSync(join(assetFolderPath, 'config-undeclared-extension.yaml')).toString();

  const otelcolConfigInvalidUndeclaredReceiver = readFileSync(join(assetFolderPath, 'config-undeclared-receiver.yaml')).toString();

  const defaultTimeout = 10_000; // 10 seconds

  describe(`POST ${validationReleasePath}`, () => {

    test('rejects unauthenticated requests', async () => {
      axios.defaults.baseURL = validationUrl;

      await expect(axios.post(validationUrl, otelcolConfigValid)).rejects.toThrow();
    }, defaultTimeout);

    test('accepts valid configuration', async () => {
      axios.defaults.baseURL = validationUrl;

      await expect(axios.post(validationUrl, otelcolConfigValid, {
        headers: {
          'Content-Type': 'application/yaml',
          'X-Api-Key': apiKey,
        },
      })).resolves.toMatchObject({
        status: 200,
        data: {
          message: 'Configuration is valid',
        },
      });
    }, defaultTimeout);

    test('rejects empty configuration', async () => {
      axios.defaults.baseURL = validationUrl;

      await expect(axios.post(validationUrl, '', {
        headers: {
          'Content-Type': 'application/yaml',
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
      axios.defaults.baseURL = validationUrl;

      await expect(axios.post(validationUrl, otelcolConfigInvalidNoReceivers, {
        headers: {
          'Content-Type': 'application/yaml',
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
      axios.defaults.baseURL = validationUrl;

      await expect(axios.post(validationUrl, otelcolConfigInvalidUndeclaredReceiver, {
        headers: {
          'Content-Type': 'application/yaml',
          'X-Api-Key': apiKey,
        },
      })).resolves.toMatchObject({
        status: 200,
        data: {
          message: 'The provided configuration is invalid',
          error: 'service::pipelines::traces: references receiver "jaeger" which is not configured',
        },
      });
    }, defaultTimeout);

    test('rejects configuration with undeclared extension', async () => {
      axios.defaults.baseURL = validationUrl;

      await expect(axios.post(validationUrl, otelcolConfigInvalidUndeclaredExtension, {
        headers: {
          'Content-Type': 'application/yaml',
          'X-Api-Key': apiKey,
        },
      })).resolves.toMatchObject({
        status: 200,
        data: {
          message: 'The provided configuration is invalid',
          error: 'service::extensions: references extension "health_check" which is not configured',
        },
      });
    }, defaultTimeout);

  });

});