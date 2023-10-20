/*
 * Jest-based integration tests
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, test } from '@jest/globals';
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

describe.each(enumerateTestCases())('Validation API', () => {
  test('yes', () => {

  });

});