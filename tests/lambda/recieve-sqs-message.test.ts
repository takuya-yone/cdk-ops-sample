import {
  DeleteMessageBatchCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  ReceiveMessageResult,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";
import { lambdaHandler } from "../../src/function/recieve-sqs-message";

const sqsMock = mockClient(SQSClient);

describe("create-index-trigger.ts", () => {
  beforeEach(() => {
    sqsMock.reset();
  });

  it("w/ 0 sqs message", async () => {
    // ダミーのレスポンス定義
    sqsMock
      .on(GetQueueAttributesCommand)
      .resolves({ Attributes: { ApproximateNumberOfMessages: "0" } });

    // for AWSのAPI実行内容確認
    // const sqsMockCalls = sqsMock.calls();

    const response = await lambdaHandler();

    expect(response).toBe("No messages in the queue");
  });

  it("w/ 1 sqs message", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "1",
      },
    });

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test",
          ReceiptHandle: "test",
          Body: "test",
        },
      ],
    };
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult);

    const response = await lambdaHandler();

    expect(response).toStrictEqual(["test"]);
  });

  it("w/ 3 sqs message", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "3",
      },
    });

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test1",
          ReceiptHandle: "test1",
          Body: "test1",
        },
        {
          MessageId: "test2",
          ReceiptHandle: "test2",
          Body: "test2",
        },
        {
          MessageId: "test3",
          ReceiptHandle: "test3",
          Body: "test3",
        },
      ],
    };
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult);

    const response = await lambdaHandler();

    expect(response).toStrictEqual(["test1", "test2", "test3"]);
  });

  it("inspect sqs client commands", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "3",
      },
    });

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test1",
          ReceiptHandle: "test1",
          Body: "test1",
        },
        {
          MessageId: "test2",
          ReceiptHandle: "test2",
          Body: "test2",
        },
        {
          MessageId: "test3",
          ReceiptHandle: "test3",
          Body: "test3",
        },
      ],
    };
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult);

    await lambdaHandler();

    const sqsMockCalls = sqsMock.calls();
    expect(sqsMockCalls.length).toEqual(2);

    const calledGetAttributeCommand = sqsMock.commandCalls(
      GetQueueAttributesCommand
    );
    expect(calledGetAttributeCommand.length).toBe(1);
    expect(calledGetAttributeCommand[0].args[0].input).toEqual({
      AttributeNames: [
        "ApproximateNumberOfMessages",
        "ApproximateNumberOfMessagesNotVisible",
        "ApproximateNumberOfMessagesDelayed",
      ],
      QueueUrl:
        "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
    });

    const calledReceiveMessageCommand = sqsMock.commandCalls(
      ReceiveMessageCommand
    );
    expect(calledReceiveMessageCommand.length).toBe(1);
    expect(calledReceiveMessageCommand[0].args[0].input).toEqual({
      MaxNumberOfMessages: 10,
      QueueUrl:
        "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
    });
  });
});
