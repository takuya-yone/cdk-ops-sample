import { Logger } from "@aws-lambda-powertools/logger"
import {
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs"

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

export const getDate = (): Date => {
  return new Date()
}

export const fetchWazaName = async (machineId: string): Promise<string> => {
  const response = await fetch(
    `${process.env.API_BASE_URL}/api/v2/machine/${machineId}`,
  )
  const json = (await response.json()) as WazaMachineResponse
  return json.move?.name ?? "Unknown Waza"
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

const logger = new Logger({ serviceName: "serverlessAirline" })

export const lambdaHandler = async (): Promise<LambdaResponse> => {
  // SQSの属性情報取得
  const sqsAttfribute = await sqsClient.send(sqsGetQueueAttributesCommand)

  // メッセージが存在しない場合は終了
  if (sqsAttfribute.Attributes?.ApproximateNumberOfMessages === "0") {
    logger.info(getDate().toISOString())
    return []
  }

  // SQSメッセージの受信
  const sqsMessage = await sqsClient.send(sqsRecieveMessageCommand)
  if (!sqsMessage.Messages || sqsMessage.Messages.length === 0) {
    logger.info(getDate().toISOString())
    return []
  }

  const result: LambdaResponse = await Promise.all(
    sqsMessage.Messages.map(async (message) => {
      const wazaName = await fetchWazaName(message.Body ?? "no body")
      return { wazaName: wazaName, timestamp: getDate().toISOString() }
    }),
  )

  return result
}
