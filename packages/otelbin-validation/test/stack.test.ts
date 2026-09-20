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

  // Every stack that CloudFormation deploys, parent and nested alike. `assembly.stacks` holds
  // only the parent, so checking that alone leaves the nested stacks unverified, which is where
  // every Lambda function and log group lives.
  const allTemplates: Array<{ name: string; resources: Record<string, unknown> }> = [
    ...assembly.stacks.map(s => ({
      name: s.stackName,
      resources: (s.template.Resources || {}) as Record<string, unknown>,
    })),
    ...nestedStacks.map(ns => ({
      name: ns.node.id,
      resources: (Template.fromStack(ns).toJSON().Resources || {}) as Record<string, unknown>,
    })),
  ];

  test('no stack exceeds the CloudFormation resource limit', () => {
    for (const { name, resources } of allTemplates) {
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
          `Stack '${name}' has ${resourceCount} resources, ` +
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

  test('every validation Lambda has its own declared log group with three-day retention', () => {
    expect(nestedStacks.length).toBeGreaterThan(0);

    for (const nestedStack of nestedStacks) {
      const template = Template.fromStack(nestedStack);
      const functions = template.findResources('AWS::Lambda::Function');
      const logGroups = template.findResources('AWS::Logs::LogGroup');

      // One group per function, so a new release cannot quietly ship without a retention policy.
      expect(Object.keys(logGroups).length).toBe(Object.keys(functions).length);
      expect(Object.keys(functions).length).toBeGreaterThan(0);

      for (const logGroup of Object.values(logGroups)) {
        const properties = (logGroup as { Properties?: { RetentionInDays?: number } }).Properties;
        expect(properties?.RetentionInDays).toBe(3);
      }

      // Without LoggingConfig the function writes to an implicit /aws/lambda/<name> group that
      // CloudFormation does not own, and the retention above would apply to nothing.
      for (const lambdaFunction of Object.values(functions)) {
        const properties = (lambdaFunction as { Properties?: { LoggingConfig?: { LogGroup?: unknown } } }).Properties;
        expect(properties?.LoggingConfig?.LogGroup).toBeDefined();
      }
    }
  });

  test('nothing sets log retention at runtime through an IAM permission', () => {
    // Log retention used to be applied by a custom resource that looped over every log group at
    // deploy time. Retention is declarative now, so no principal in the stack should still be
    // able to call PutRetentionPolicy. This fails if that pattern comes back.
    for (const { name, resources } of allTemplates) {
      for (const [logicalId, resource] of Object.entries(resources)) {
        const typed = resource as { Type?: string; Properties?: { PolicyDocument?: { Statement?: unknown[] } } };
        if (typed.Type !== 'AWS::IAM::Policy' && typed.Type !== 'AWS::IAM::Role') {
          continue;
        }

        const serialized = JSON.stringify(typed.Properties ?? {});
        expect(serialized).not.toContain('logs:PutRetentionPolicy');
        expect(`${name}/${logicalId}`).not.toContain('logretention');
      }
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
