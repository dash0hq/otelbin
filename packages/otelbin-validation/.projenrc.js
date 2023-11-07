const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.99.1',
  defaultReleaseBranch: 'main',
  name: 'otelbin-validation',
  deps: ['aws-lambda'],
  devDeps: ['@jest/globals', '@types/aws-lambda', 'axios', 'esbuild', 'jest-circus'],
  github: false, // Skip GitHub integration, as this CDK app is not in the repo's root
  packageManager: 'npm',
  eslintOptions: {
    ignorePatterns: [
      '*.js',
      '*.d.ts',
      'node_modules/',
      '*.generated.ts',
      'coverage',
      'src/images/otelcol-validator/',
    ],
  },
  jestOptions: {
    jestConfig: {
      testRunner: 'jest-circus/runner',
    },
  },
});
project.synth();
