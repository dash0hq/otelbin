import { CloudWatchLogsClient, CreateLogGroupCommand, PutRetentionPolicyCommand } from '@aws-sdk/client-cloudwatch-logs';

export interface CloudFormationCustomResourceEvent {
  RequestType: 'Create' | 'Update' | 'Delete';
  PhysicalResourceId?: string;
  ResourceProperties: {
    LogGroupNames?: string[];
    RetentionInDays?: string;
    [key: string]: unknown;
  };
}

export interface CloudFormationCustomResourceResponse {
  PhysicalResourceId: string;
}

export async function handler(
  event: CloudFormationCustomResourceEvent,
  client: CloudWatchLogsClient = new CloudWatchLogsClient(),
): Promise<CloudFormationCustomResourceResponse> {
  if (event.RequestType === 'Delete') {
    return { PhysicalResourceId: event.PhysicalResourceId || 'log-retention-policy' };
  }

  const logGroupNames = event.ResourceProperties.LogGroupNames || [];
  const retentionInDays = Number.parseInt(event.ResourceProperties.RetentionInDays || '0');

  for (const logGroupName of logGroupNames) {
    try {
      await client.send(new CreateLogGroupCommand({ logGroupName }));
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'ResourceAlreadyExistsException') throw e;
    }
    await client.send(new PutRetentionPolicyCommand({ logGroupName, retentionInDays }));
  }

  return { PhysicalResourceId: 'log-retention-policy' };
}
