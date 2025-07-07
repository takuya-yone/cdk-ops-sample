import { Logger } from "@aws-lambda-powertools/logger"
import {
  DeleteMessageBatchCommand,
  GetQueueAttributesCommand,
  type Message,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs"

// Importing the getNow function from the nodejs-layer
import { getNow } from "nodejs-layer"

const sqsClient = new SQSClient({
  maxAttempts: 3,
})

type WazaMachineResponse = {
  move?: {
    name?: string
  }
}

type LambdaResponse = {
  wazaName: string
  timestamp: string
}[]

export const fetchWazaName = async (machineId: string): Promise<string> => {
  const response = await fetch(
    `${process.env.API_BASE_URL}/api/v2/machine/${machineId}`,
  )
  const json = (await response.json()) as WazaMachineResponse
  return json.move?.name ?? "Unknown Waza Name"
}

// SQSキューの属性情報取得コマンド
const sqsGetQueueAttributesCommand = new GetQueueAttributesCommand({
  QueueUrl: process.env.QUEUE_URL,
  AttributeNames: [
    "ApproximateNumberOfMessages",
    "ApproximateNumberOfMessagesNotVisible",
    "ApproximateNumberOfMessagesDelayed",
  ],
})

// SQSメッセージ受信コマンド
const sqsRecieveMessageCommand = new ReceiveMessageCommand({
  QueueUrl: process.env.QUEUE_URL,
  MaxNumberOfMessages: 10,
})

// SQSメッセージ削除コマンド
const _sqsDeleteMessageBatchCommand = (messages: Message[]) =>
  new DeleteMessageBatchCommand({
    QueueUrl: process.env.QUEUE_URL,
    Entries: messages.map((message) => ({
      Id: message.MessageId,
      ReceiptHandle: message.ReceiptHandle,
    })),
  })

const logger = new Logger({ serviceName: "serverlessAirline" })

export const lambdaHandler = async (): Promise<LambdaResponse> => {
  // SQSの属性情報取得
  const sqsAttribute = await sqsClient.send(sqsGetQueueAttributesCommand)

  // メッセージが存在しない場合は終了
  if (sqsAttribute.Attributes?.ApproximateNumberOfMessages === "0") {
    return []
  }

  // SQSメッセージの受信
  const sqsMessage = await sqsClient.send(sqsRecieveMessageCommand)
  if (!sqsMessage.Messages || sqsMessage.Messages.length === 0) {
    logger.info(getNow().toISOString())
    return []
  }

  const result: LambdaResponse = await Promise.all(
    sqsMessage.Messages.map(async (message) => {
      const wazaName = await fetchWazaName(message.Body ?? "no body")
      return { wazaName: wazaName, timestamp: getNow().toISOString() }
    }),
  )

  // メッセージ削除コマンドの実行
  const batchDeleteCommand = _sqsDeleteMessageBatchCommand(sqsMessage.Messages)
  await sqsClient.send(batchDeleteCommand)

  return result
}
