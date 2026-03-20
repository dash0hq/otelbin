/**
 * CDK stack synthesis tests.
 *
 * These tests synthesize the CloudFormation template locally (no AWS credentials
 * or deployment needed) and verify structural properties of the stack.
 *
 * Run standalone: npx jest test/stack.test.ts
 */

// Set GH_TOKEN before importing the stack module, which checks for it at load time.
process.env.GH_TOKEN = process.env.GH_TOKEN || 'test-token';

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, test } from '@jest/globals';
import { App } from 'aws-cdk-lib';
import { Distributions, OTelBinValidationStack } from '../src/main';

const CF_MAX_RESOURCES = 500;

describe('OTelBinValidationStack synthesis', () => {
  const app = new App();
  new OTelBinValidationStack(app, 'test-stack', {
    testEnvironmentName: 'test',
    githubToken: 'test-token',
  });
  const assembly = app.synth();

  test('no stack exceeds the CloudFormation resource limit', () => {
    for (const stackArtifact of assembly.stacks) {
      const resources = stackArtifact.template.Resources || {};
      const resourceCount = Object.keys(resources).length;

      if (resourceCount > CF_MAX_RESOURCES) {
        const byType: Record<string, number> = {};
        for (const resource of Object.values(resources)) {
          const type = (resource as Record<string, unknown>).Type as string;
          byType[type] = (byType[type] || 0) + 1;
        }
        const breakdown = Object.entries(byType)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => `  ${type}: ${count}`)
          .join('\n');

        throw new Error(
          `Stack '${stackArtifact.stackName}' has ${resourceCount} resources, ` +
          `which exceeds the CloudFormation limit of ${CF_MAX_RESOURCES}.\n` +
          `Resource breakdown:\n${breakdown}`,
        );
      }
    }
  });

  test('uses a nested stack for each distribution', () => {
    const distributions: Distributions = JSON.parse(
      readFileSync(join(__dirname, '..', 'src', 'assets', 'supported-distributions.json')).toString(),
    );
    const distributionCount = Object.keys(distributions).length;

    const parentStack = assembly.stacks.find(s => s.stackName === 'test-stack');
    expect(parentStack).toBeDefined();

    const resources = parentStack!.template.Resources || {};
    const nestedStackCount = Object.values(resources).filter(
      (r: unknown) => (r as Record<string, unknown>).Type === 'AWS::CloudFormation::Stack',
    ).length;

    expect(nestedStackCount).toBe(distributionCount);
  });

  test('nested stacks do not create individual Lambda execution roles', () => {
    const nestedStacks = assembly.stacks.filter(s => s.stackName !== 'test-stack');

    for (const nestedStack of nestedStacks) {
      const resources = nestedStack.template.Resources || {};
      const iamRoles = Object.values(resources).filter(
        (r: unknown) => (r as Record<string, unknown>).Type === 'AWS::IAM::Role',
      );

      expect(iamRoles).toHaveLength(0);
    }
  });
});
