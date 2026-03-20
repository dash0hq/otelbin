import { describe, expect, jest, test } from '@jest/globals';
import { CloudWatchLogsClient, CreateLogGroupCommand, PutRetentionPolicyCommand } from '@aws-sdk/client-cloudwatch-logs';
import { handler, CloudFormationCustomResourceEvent } from './log-retention-handler';

function mockClient(overrides: {
  createLogGroupError?: Error;
  putRetentionPolicyError?: Error;
} = {}) {
  const sendMock = jest.fn<CloudWatchLogsClient['send']>();

  sendMock.mockImplementation(async (command: unknown) => {
    if (command instanceof CreateLogGroupCommand) {
      if (overrides.createLogGroupError) throw overrides.createLogGroupError;
      return {} as never;
    }
    if (command instanceof PutRetentionPolicyCommand) {
      if (overrides.putRetentionPolicyError) throw overrides.putRetentionPolicyError;
      return {} as never;
    }
    throw new Error(`Unexpected command: ${command}`);
  });

  return { client: { send: sendMock } as unknown as CloudWatchLogsClient, sendMock };
}

function makeEvent(overrides: Partial<CloudFormationCustomResourceEvent> = {}): CloudFormationCustomResourceEvent {
  return {
    RequestType: 'Create',
    ResourceProperties: {
      LogGroupNames: ['/aws/lambda/test-fn-1', '/aws/lambda/test-fn-2'],
      RetentionInDays: '3',
    },
    ...overrides,
  };
}

describe('log-retention-handler', () => {
  test('creates log groups and sets retention on Create', async () => {
    const { client, sendMock } = mockClient();
    const event = makeEvent();

    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('log-retention-policy');
    expect(sendMock).toHaveBeenCalledTimes(4); // 2 CreateLogGroup + 2 PutRetentionPolicy

    expect(sendMock).toHaveBeenNthCalledWith(1, expect.any(CreateLogGroupCommand));
    expect(sendMock).toHaveBeenNthCalledWith(2, expect.any(PutRetentionPolicyCommand));
    expect(sendMock).toHaveBeenNthCalledWith(3, expect.any(CreateLogGroupCommand));
    expect(sendMock).toHaveBeenNthCalledWith(4, expect.any(PutRetentionPolicyCommand));
  });

  test('creates log groups and sets retention on Update', async () => {
    const { client, sendMock } = mockClient();
    const event = makeEvent({ RequestType: 'Update' });

    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('log-retention-policy');
    expect(sendMock).toHaveBeenCalledTimes(4);
  });

  test('is a no-op on Delete', async () => {
    const { client, sendMock } = mockClient();
    const event = makeEvent({
      RequestType: 'Delete',
      PhysicalResourceId: 'existing-id',
    });

    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('existing-id');
    expect(sendMock).not.toHaveBeenCalled();
  });

  test('returns fallback PhysicalResourceId on Delete without one', async () => {
    const { client } = mockClient();
    const event = makeEvent({ RequestType: 'Delete', PhysicalResourceId: undefined });

    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('log-retention-policy');
  });

  test('ignores ResourceAlreadyExistsException on CreateLogGroup', async () => {
    const alreadyExists = new Error('Log group already exists');
    alreadyExists.name = 'ResourceAlreadyExistsException';
    const { client, sendMock } = mockClient({ createLogGroupError: alreadyExists });

    const event = makeEvent();
    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('log-retention-policy');
    // Should still call PutRetentionPolicy for each log group
    const putCalls = sendMock.mock.calls.filter(
      ([cmd]) => cmd instanceof PutRetentionPolicyCommand,
    );
    expect(putCalls).toHaveLength(2);
  });

  test('propagates unexpected errors from CreateLogGroup', async () => {
    const accessDenied = new Error('Access denied');
    accessDenied.name = 'AccessDeniedException';
    const { client } = mockClient({ createLogGroupError: accessDenied });

    await expect(handler(makeEvent(), client)).rejects.toThrow('Access denied');
  });

  test('propagates errors from PutRetentionPolicy', async () => {
    const throttled = new Error('Rate exceeded');
    throttled.name = 'ThrottlingException';
    const { client } = mockClient({ putRetentionPolicyError: throttled });

    await expect(handler(makeEvent(), client)).rejects.toThrow('Rate exceeded');
  });

  test('handles empty LogGroupNames', async () => {
    const { client, sendMock } = mockClient();
    const event = makeEvent({
      ResourceProperties: { LogGroupNames: [], RetentionInDays: '3' },
    });

    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('log-retention-policy');
    expect(sendMock).not.toHaveBeenCalled();
  });

  test('handles missing LogGroupNames', async () => {
    const { client, sendMock } = mockClient();
    const event = makeEvent({
      ResourceProperties: { RetentionInDays: '3' },
    });

    const result = await handler(event, client);

    expect(result.PhysicalResourceId).toBe('log-retention-policy');
    expect(sendMock).not.toHaveBeenCalled();
  });

  test('passes correct log group name and retention to AWS SDK', async () => {
    const { client, sendMock } = mockClient();
    const event = makeEvent({
      ResourceProperties: {
        LogGroupNames: ['/aws/lambda/my-function'],
        RetentionInDays: '7',
      },
    });

    await handler(event, client);

    const createCall = sendMock.mock.calls[0][0] as CreateLogGroupCommand;
    expect(createCall.input).toEqual({ logGroupName: '/aws/lambda/my-function' });

    const putCall = sendMock.mock.calls[1][0] as PutRetentionPolicyCommand;
    expect(putCall.input).toEqual({ logGroupName: '/aws/lambda/my-function', retentionInDays: 7 });
  });
});
