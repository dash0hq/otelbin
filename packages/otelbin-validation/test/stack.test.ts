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
import { App, NestedStack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DASH0_AUTHORIZATION_TOKEN_SECRET_NAME, Distributions, OTelBinValidationStack } from '../src/main';

const CF_MAX_RESOURCES = 500;

describe('OTelBinValidationStack synthesis', () => {
  const app = new App();
  const stack = new OTelBinValidationStack(app, 'test-stack', {
    testEnvironmentName: 'test',
    githubToken: 'test-token',
  });
  const assembly = app.synth();

  // NestedStack templates are synthesized as assets (referenced via TemplateURL), not as
  // top-level entries in the cloud assembly - assembly.stacks only has the parent. Template.
  // fromStack() synthesizes a nested stack's own template directly from the construct instead.
  const nestedStacks = app.node.findAll().filter((c): c is NestedStack => c instanceof NestedStack);

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
    expect(nestedStacks.length).toBeGreaterThan(0);

    for (const nestedStack of nestedStacks) {
      Template.fromStack(nestedStack).resourceCountIs('AWS::IAM::Role', 0);
    }
  });

  test('the Dash0 authorization token is resolved via a Secrets Manager dynamic reference, never inlined', () => {
    expect(nestedStacks.length).toBeGreaterThan(0);

    const expected = `{{resolve:secretsmanager:${DASH0_AUTHORIZATION_TOKEN_SECRET_NAME}:SecretString:::}}`;
    let sawLambdaFunction = false;

    for (const nestedStack of nestedStacks) {
      const lambdas = Template.fromStack(nestedStack).findResources('AWS::Lambda::Function');

      for (const resource of Object.values(lambdas)) {
        const variables = (resource as { Properties?: { Environment?: { Variables?: Record<string, unknown> } } }).Properties?.Environment?.Variables;
        const token = variables?.DASH0_AUTHORIZATION_TOKEN;
        if (token === undefined) {
          continue;
        }

        sawLambdaFunction = true;
        expect(token).toBe(expected);
      }
    }

    expect(sawLambdaFunction).toBe(true);
  });
});
