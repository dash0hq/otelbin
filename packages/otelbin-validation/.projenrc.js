const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.99.1',
  defaultReleaseBranch: 'main',
  name: 'otelbin-validation',
  deps: ['@aws-sdk/client-cloudwatch-logs', 'aws-lambda'],
  devDeps: ['@jest/globals', '@types/aws-lambda', 'axios', 'esbuild', 'jest-circus'],
  github: false, // Skip GitHub integration, as this CDK app is not in the repo's root
  packageManager: 'npm',
  minNodeVersion: '22.0.0',
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
project.eslint.addOverride({
  files: ['src/**/*.test.ts'],
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      optionalDependencies: false,
      peerDependencies: true,
    }],
  },
});
project.synth();
