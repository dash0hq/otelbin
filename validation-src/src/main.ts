import { App, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { ApiKeySourceType, AwsIntegration, LambdaIntegration, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { join } from 'path';

declare global {
  namespace NodeJS {
      interface ProcessEnv {
          TEST_ENVIRONMENT_NAME: string;
      }
  }
}

interface Distributions {
  [id: string]: Distribution;
}

interface Distribution {
  provider: string;
  description: string;
  website: string;
  repository: string;
  releases: Release[];
}

interface Release {
  version: string;
  artifact: string;
}

export interface OTelBinValidationStackProps extends StackProps {
  githubToken: string;
}

export class OTelBinValidationStack extends Stack {
  constructor(scope: Construct, id: string, props: OTelBinValidationStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'validation-api', {
      restApiName: 'otelbin-validation',
      binaryMediaTypes: ['application/json'],
      apiKeySourceType: ApiKeySourceType.HEADER,
    });
    const apiKey = api.addApiKey('api-key', {
      apiKeyName: 'otelbin-apikey',
    });

    const usagePlan = new UsagePlan(this, 'usage-plan', {
      name: 'validation-api-usage-plan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);

    const validation = api.root.addResource('validation', {
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });

    const supportedDistributionsPath = join(__dirname, 'assets');

    const supportedDistributionsListBucket = new Bucket(this, 'supported-distributions-list', {
      bucketName: 'supported-distributions-list',
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new BucketDeployment(this, 'deploy-supported-distributions-list', {
      sources: [
        Source.asset(supportedDistributionsPath),
      ],
      destinationBucket: supportedDistributionsListBucket,
    });

    const credentialsRole = new Role(this, 'api-gateway-s3-assume-role', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      roleName: 'API-Gateway-Serve-Supported-Distributions-List',
    });
    credentialsRole.addToPolicy(
      new PolicyStatement({
        resources: [
          supportedDistributionsListBucket.bucketArn
        ],
        actions: [
          's3:Get'
        ],
      })
    );

    supportedDistributionsListBucket.grantRead(credentialsRole);

    const supportedDistributionsIntegration = new AwsIntegration({
      service: 's3',
      integrationHttpMethod: 'GET',
      path: `${supportedDistributionsListBucket.bucketName}/supported-distributions.json`,
      options: {
        credentialsRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': 'integration.response.header.Content-Type',
            },
          },
        ],
        requestParameters: {
          'integration.request.path.folder': 'method.request.path.folder',
          'integration.request.path.key': 'method.request.path.key',
        },
      },
    });

    const supportedDistributionsResource = validation.addResource('supported-distributions');
    supportedDistributionsResource.addMethod('GET', supportedDistributionsIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        },
      ],
      requestParameters: {
        'method.request.path.folder': true,
        'method.request.path.key': true,
        'method.request.header.Content-Type': true,
      },
    });

    const supportedDistributions = require(join(__dirname, 'assets', 'supported-distributions')) as Distributions;
    for (let [id, distribution] of Object.entries(supportedDistributions)) {
      const distributionResource = validation.addResource(id);

      for (let release of distribution.releases) {
        const releaseLambda = new DockerImageFunction(this, `${id}-${release.version}`, {
          architecture: Architecture.X86_64,
          code: DockerImageCode.fromImageAsset(join(__dirname, 'images', 'otelcol-validator'), {
            platform: Platform.LINUX_AMD64,
            buildArgs: {
              DISTRO_NAME: id,
              GH_TOKEN: props.githubToken,
              GH_REPOSITORY: distribution.repository,
              GH_RELEASE: release.version,
              GH_ARTIFACT: release.artifact,
            },
          }),
          /*
           * The default 128 cause the OtelCol process to swap a lot, and that increased
           * latency by a couple seconds in cold start and normal validations when testing
           * with the Otelcol Contrib v0.85.1.
           */
          memorySize: 1024,
          timeout: Duration.seconds(15),
        });

        const releaseResource = distributionResource.addResource(release.version);
        releaseResource.addMethod('POST', new LambdaIntegration(releaseLambda), {
          apiKeyRequired: true,
        });
      }
    }
  }
}

// for development, use account/region from cdk cli
if (!process.env.GH_TOKEN) {
  throw new Error('No GitHub token provided via the "GH_TOKEN" environment variable');
}

const testEnvironmentName = process.env.TEST_ENVIRONMENT_NAME || 'dev';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
  githubToken: process.env.GH_TOKEN,
};

const app = new App();

new OTelBinValidationStack(app, `otelbin-validation-${testEnvironmentName}`, env);

app.synth();