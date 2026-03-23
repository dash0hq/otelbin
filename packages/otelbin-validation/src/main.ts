import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { App, CfnOutput, CustomResource, Duration, NestedStack, NestedStackProps, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { ApiKeySourceType, AwsIntegration, IResource, LambdaIntegration, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, DockerImageCode, DockerImageFunction, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

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
  dash0AuthorizationToken?: string;
}

export class DistributionNestedStack extends NestedStack {
  readonly lambdaFunctions: DockerImageFunction[] = [];

  constructor(scope: Construct, id: string, props: DistributionNestedStackProps) {
    super(scope, id, props);

    const distributionResource = props.validationResource.addResource(props.distributionName);

    for (let release of props.distribution.releases) {
      const releaseLambda = new DockerImageFunction(this, `${props.distributionName}-${release.version}`, {
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
          DASH0_AUTHORIZATION_TOKEN: props.dash0AuthorizationToken || '',
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
      this.lambdaFunctions.push(releaseLambda);
    }
  }
}

export interface OTelBinValidationStackProps extends StackProps {
  testEnvironmentName: string;
  githubToken: string;
  dash0AuthorizationToken?: string;
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

    const allLambdaFunctions: DockerImageFunction[] = [];

    for (let [distributionName, distribution] of Object.entries(supportedDistributions)) {
      const nestedStack = new DistributionNestedStack(this, `distribution-${distributionName}`, {
        validationResource: validation,
        lambdaExecutionRole,
        distributionName,
        distribution,
        githubToken: props.githubToken,
        dash0AuthorizationToken: props.dash0AuthorizationToken,
      });
      allLambdaFunctions.push(...nestedStack.lambdaFunctions);
    }

    const logRetentionHandler = new LambdaFunction(this, 'log-retention-handler', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      // language=JavaScript
      code: Code.fromInline(`
const { CloudWatchLogsClient, CreateLogGroupCommand, PutRetentionPolicyCommand } = require("@aws-sdk/client-cloudwatch-logs");
exports.handler = async (event) => {
  if (event.RequestType === "Delete") {
    return { PhysicalResourceId: event.PhysicalResourceId };
  }
  const client = new CloudWatchLogsClient();
  const logGroupNames = event.ResourceProperties.LogGroupNames || [];
  const retentionInDays = parseInt(event.ResourceProperties.RetentionInDays);
  for (const logGroupName of logGroupNames) {
    try {
      await client.send(new CreateLogGroupCommand({ logGroupName }));
    } catch (e) {
      if (e.name !== "ResourceAlreadyExistsException") throw e;
    }
    await client.send(new PutRetentionPolicyCommand({ logGroupName, retentionInDays }));
  }
  return { PhysicalResourceId: "log-retention-policy" };
};
      `),
      timeout: Duration.minutes(5),
    });

    logRetentionHandler.addToRolePolicy(new PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:PutRetentionPolicy'],
      resources: ['*'],
    }));

    const logRetentionProvider = new Provider(this, 'log-retention-provider', {
      onEventHandler: logRetentionHandler,
    });

    new CustomResource(this, 'log-retention-policy', {
      serviceToken: logRetentionProvider.serviceToken,
      properties: {
        LogGroupNames: allLambdaFunctions.map(fn => `/aws/lambda/${fn.functionName}`),
        RetentionInDays: '3',
      },
    });

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
  dash0AuthorizationToken: process.env.DASH0_AUTHORIZATION_TOKEN,
};

const app = new App();

new OTelBinValidationStack(app, `otelbin-validation-${testEnvironmentName}`, env);

app.synth();
