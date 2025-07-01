import {
  GetQueueAttributesCommand,
  type Message,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  maxAttempts: 3,
});

// SQSキューの属性情報取得コマンド
const sqsGetQueueAttributesCommand = new GetQueueAttributesCommand({
  QueueUrl: process.env.SAMPLE_QUEUE_URL,
  AttributeNames: [
    "ApproximateNumberOfMessages",
    "ApproximateNumberOfMessagesNotVisible",
    "ApproximateNumberOfMessagesDelayed",
  ],
});

// SQSメッセージ受信コマンド
const sqsRecieveMessageCommand = new ReceiveMessageCommand({
  QueueUrl: process.env.SAMPLE_QUEUE_URL,
  MaxNumberOfMessages: 10,
});

export const lambdaHandler = async () => {
  // SQSの属性情報取得
  const sqsAttfribute = await sqsClient.send(sqsGetQueueAttributesCommand);

  // メッセージが存在しない場合は終了
  if (sqsAttfribute.Attributes?.ApproximateNumberOfMessages === "0") {
    return "No messages in the queue";
  }

  // SQSメッセージの受信
  const sqsMessage = await sqsClient.send(sqsRecieveMessageCommand);
  if (!sqsMessage.Messages || sqsMessage.Messages.length === 0) {
    return "No messages received";
  }
  return sqsMessage.Messages.map((message: Message) => message.Body);
};
