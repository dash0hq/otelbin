import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { App, CfnOutput, Duration, NestedStack, NestedStackProps, RemovalPolicy, SecretValue, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { ApiKeySourceType, AwsIntegration, IResource, LambdaIntegration, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

// Resolved by CloudFormation at deploy time via a dynamic reference, so the actual secret value
// never appears in the synthesized template (or any CI artifact derived from it) - only this
// placeholder name does. The secret must exist under this name in Secrets Manager in every
// account this stack is deployed to.
export const DASH0_AUTHORIZATION_TOKEN_SECRET_NAME = 'otelbin-validation/dash0-authorization-token';

export interface Distributions {
  [key: string]: Distribution;
}

export interface Distribution {
  provider: string;
  description: string;
  website: string;
  repository: string;
  releases: Release[];
}

export interface Release {
  version: string;
  artifact: string;
}

export interface DistributionNestedStackProps extends NestedStackProps {
  validationResource: IResource;
  lambdaExecutionRole: Role;
  distributionName: string;
  distribution: Distribution;
  githubToken: string;
}

export class DistributionNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props: DistributionNestedStackProps) {
    super(scope, id, props);

    const distributionResource = props.validationResource.addResource(props.distributionName);

    for (let release of props.distribution.releases) {
      /*
       * Declared explicitly so that CloudFormation owns the retention setting and the group's
       * lifecycle. Left implicit, Lambda creates /aws/lambda/<function> on first invocation with
       * retention set to Never Expire, and nothing in the stack can express otherwise. The log
       * group name is CDK-generated rather than /aws/lambda/<function>, because the function name
       * is only known after the function is created and the function needs the group up front.
       */
      const releaseLogGroup = new LogGroup(this, `${props.distributionName}-${release.version}-logs`, {
        retention: RetentionDays.THREE_DAYS,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      const releaseLambda = new DockerImageFunction(this, `${props.distributionName}-${release.version}`, {
        logGroup: releaseLogGroup,
        description: `Configuration validation for the the '${props.distributionName}' distribution, version '${release.version}'`,
        architecture: Architecture.X86_64,
        role: props.lambdaExecutionRole,
        code: DockerImageCode.fromImageAsset(join(dirname(dirname(__dirname)), 'otelbin-validation-image'), {
          platform: Platform.LINUX_AMD64,
          buildArgs: {
            DISTRO_NAME: props.distributionName,
            GH_TOKEN: props.githubToken,
            GH_REPOSITORY: props.distribution.repository,
            GH_RELEASE: release.version,
            GH_ARTIFACT: release.artifact,
          },
        }),
        environment: {
          DISTRO_NAME: props.distributionName,
          DASH0_AUTHORIZATION_TOKEN: SecretValue.secretsManager(DASH0_AUTHORIZATION_TOKEN_SECRET_NAME).unsafeUnwrap(),
          SNOWFLAKE_CRL_ON_DISK_CACHE_DIR: '/tmp', // Remediation for https://github.com/snowflakedb/gosnowflake/pull/1526
        },
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

      Tags.of(releaseLambda).add('otelcol-version', `${props.distributionName}-${release.version}`);
    }
  }
}

export interface OTelBinValidationStackProps extends StackProps {
  testEnvironmentName: string;
  githubToken: string;
}

export class OTelBinValidationStack extends Stack {
  constructor(scope: Construct, id: string, props: OTelBinValidationStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'validation-api', {
      restApiName: `otelbin-validation-${props.testEnvironmentName}`,
      binaryMediaTypes: ['application/json'],
      apiKeySourceType: ApiKeySourceType.HEADER,
    });
    const apiKey = api.addApiKey('api-key', {
      apiKeyName: `validation-apikey-${props.testEnvironmentName}`,
    });

    const usagePlan = new UsagePlan(this, 'usage-plan', {
      name: `validation-api-${props.testEnvironmentName}`,
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
      bucketName: `supported-distributions-list-${props.testEnvironmentName}`,
      enforceSSL: true,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, 'deploy-supported-distributions-list', {
      sources: [Source.asset(supportedDistributionsPath)],
      destinationBucket: supportedDistributionsListBucket,
    });

    const credentialsRole = new Role(this, 'api-gateway-s3-assume-role', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      roleName: `serve-distributions-list-${props.testEnvironmentName}`,
    });
    credentialsRole.addToPolicy(
      new PolicyStatement({
        resources: [supportedDistributionsListBucket.bucketArn],
        actions: ['s3:Get'],
      }),
    );
    credentialsRole.applyRemovalPolicy(RemovalPolicy.DESTROY);

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

    const supportedDistributions = JSON.parse(
      (readFileSync(join(__dirname, 'assets', 'supported-distributions.json'))).toString(),
    ) as Distributions;

    const lambdaExecutionRole = new Role(this, 'lambda-execution-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromManagedPolicyArn(this, 'lambda-basic-execution', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    for (let [distributionName, distribution] of Object.entries(supportedDistributions)) {
      new DistributionNestedStack(this, `distribution-${distributionName}`, {
        validationResource: validation,
        lambdaExecutionRole,
        distributionName,
        distribution,
        githubToken: props.githubToken,
      });
    }

    new CfnOutput(this, 'api-name', {
      exportName: `api-name-${props.testEnvironmentName}`,
      value: api.restApiName,
    });

    new CfnOutput(this, 'api-url', {
      exportName: `api-url-${props.testEnvironmentName}`,
      value: api.url,
    });

    new CfnOutput(this, 'api-key-id', {
      exportName: `api-key-id-${props.testEnvironmentName}`,
      value: apiKey.keyId,
    });
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
  testEnvironmentName,
  githubToken: process.env.GH_TOKEN,
};

const app = new App();

new OTelBinValidationStack(app, `otelbin-validation-${testEnvironmentName}`, env);

app.synth();
