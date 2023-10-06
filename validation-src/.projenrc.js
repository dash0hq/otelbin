const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.99.1',
  defaultReleaseBranch: 'main',
  name: 'otelbin-validation',
  deps: [],
  devDeps: ['@types/aws-lambda', 'esbuild'],
  github: false, // Skip GitHub integration, as this CDK app is not in the repo's root
});
project.synth();