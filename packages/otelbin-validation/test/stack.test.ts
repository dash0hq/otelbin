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

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@jest/globals';
import { App } from 'aws-cdk-lib';
import { DASH0_AUTHORIZATION_TOKEN_SECRET_NAME, Distributions, OTelBinValidationStack } from '../src/main';

const CF_MAX_RESOURCES = 500;

describe('OTelBinValidationStack synthesis', () => {
  const app = new App();
  const stack = new OTelBinValidationStack(app, 'test-stack', {
    testEnvironmentName: 'test',
    githubToken: 'test-token',
  });
  const assembly = app.synth();

  test('stack is synthesized successfully', () => {
    expect(stack.stackName).toBe('test-stack');
  });

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

  test('the Dash0 authorization token is resolved via a Secrets Manager dynamic reference, never inlined', () => {
    const found: { stackName: string; resourceId: string; token: unknown }[] = [];

    for (const stackArtifact of assembly.stacks) {
      const resources = stackArtifact.template.Resources || {};

      for (const [resourceId, resource] of Object.entries(resources)) {
        const typedResource = resource as { Type: string; Properties?: Record<string, unknown> };
        if (typedResource.Type !== 'AWS::Lambda::Function') {
          continue;
        }

        const variables = (typedResource.Properties?.Environment as { Variables?: Record<string, unknown> } | undefined)?.Variables;
        const token = variables?.DASH0_AUTHORIZATION_TOKEN;
        if (token === undefined) {
          continue;
        }

        found.push({ stackName: stackArtifact.stackName, resourceId, token });
      }
    }

    if (found.length === 0) {
      // Dump every Lambda's Environment and every nested stack's Parameters so a failure here is
      // debuggable from CI output alone, without needing a local repro.
      const debugInfo = assembly.stacks.map(stackArtifact => {
        const resources = stackArtifact.template.Resources || {};
        return {
          stackName: stackArtifact.stackName,
          lambdas: Object.entries(resources)
            .filter(([, r]) => (r as { Type: string }).Type === 'AWS::Lambda::Function')
            .map(([id, r]) => ({ id, environment: (r as { Properties?: Record<string, unknown> }).Properties?.Environment })),
          nestedStackParameters: Object.entries(resources)
            .filter(([, r]) => (r as { Type: string }).Type === 'AWS::CloudFormation::Stack')
            .map(([id, r]) => ({ id, parameters: (r as { Properties?: Record<string, unknown> }).Properties?.Parameters })),
        };
      });
      throw new Error(`No Lambda function had a DASH0_AUTHORIZATION_TOKEN environment variable. Debug info:\n${JSON.stringify(debugInfo, null, 2)}`);
    }

    const expected = `{{resolve:secretsmanager:${DASH0_AUTHORIZATION_TOKEN_SECRET_NAME}:SecretString:::}}`;
    for (const { stackName, resourceId, token } of found) {
      expect({ stackName, resourceId, token }).toEqual({ stackName, resourceId, token: expected });
    }
  });
});
