import {
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  maxAttempts: 3,
});

type WazaMachineResponse = {
  move?: {
    name?: string;
  };
};

type LambdaResponse = {
  wazaName: string;
  timestamp: string;
}[];

export const getDate = (): Date => {
  return new Date();
};

export const fetchWazaName = async (machineId: string): Promise<string> => {
  const response = await fetch(
    `${process.env.SAMPLE_API_BASE}/api/v2/machine/${machineId}`,
  );
  const json = (await response.json()) as WazaMachineResponse;
  return json.move?.name ?? "Unknown Waza";
};

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
    return [];
  }

  // SQSメッセージの受信
  const sqsMessage = await sqsClient.send(sqsRecieveMessageCommand);
  if (!sqsMessage.Messages || sqsMessage.Messages.length === 0) {
    return [];
  }

  const result: LambdaResponse = await Promise.all(
    sqsMessage.Messages.map(async (message) => {
      const wazaName = await fetchWazaName(message.Body ?? "no body");
      return { wazaName: wazaName, timestamp: getDate().toISOString() };
    }),
  );

  return result;
};
