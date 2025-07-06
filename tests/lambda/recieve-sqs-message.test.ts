import {
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  type ReceiveMessageResult,
  SQSClient,
} from "@aws-sdk/client-sqs"
import { mockClient } from "aws-sdk-client-mock"
import * as dateUtils from "nodejs-layer"
import * as mainTs from "../../src/function/recieve-sqs-message"
import { lambdaHandler } from "../../src/function/recieve-sqs-message"

// SQSクライアントのモック化
const sqsMock = mockClient(SQSClient)

// 特定メソッドのモック化
const fetchWazaNameSpyOn = jest
  .spyOn(mainTs, "fetchWazaName")
  .mockResolvedValue("mock-waza-name")
// 特定メソッドのモック化
const getDateSpyOn = jest
  .spyOn(dateUtils, "getDate")
  .mockReturnValue(new Date(2000, 0, 1))

describe("recieve-sqs-message.ts w/ mock", () => {
  beforeEach(() => {
    sqsMock.reset()
  })

  // テスト完了後、モック化したメソッドの復元
  afterAll(() => {
    fetchWazaNameSpyOn.mockRestore()
    getDateSpyOn.mockRestore()
  })

  it("w/ 0 sqs message", async () => {
    // ダミーのレスポンス定義
    sqsMock
      .on(GetQueueAttributesCommand)
      .resolves({ Attributes: { ApproximateNumberOfMessages: "0" } })

    // for AWSのAPI実行内容確認
    // const sqsMockCalls = sqsMock.calls();

    // Lambdaハンドラーの実行
    const response = await lambdaHandler()

    // Lambdaレスポンスの値チェック
    expect(response).toStrictEqual([])
  })

  it("w/ 1 sqs message on mock", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "1",
      },
    })

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test",
          ReceiptHandle: "test",
          Body: "11",
        },
      ],
    }
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult)

    // Lambdaハンドラーの実行
    const response = await lambdaHandler()

    // Lambdaレスポンスの値チェック
    expect(response).toStrictEqual([
      { wazaName: "mock-waza-name", timestamp: "1999-12-31T15:00:00.000Z" },
    ])
  })

  it("w/ 3 sqs message", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "3",
      },
    })

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test1",
          ReceiptHandle: "test1",
          Body: "11",
        },
        {
          MessageId: "test2",
          ReceiptHandle: "test2",
          Body: "22",
        },
        {
          MessageId: "test3",
          ReceiptHandle: "test3",
          Body: "33",
        },
      ],
    }
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult)

    // Lambdaハンドラーの実行
    const response = await lambdaHandler()

    // Lambdaレスポンスの値チェック
    expect(response).toStrictEqual([
      { wazaName: "mock-waza-name", timestamp: "1999-12-31T15:00:00.000Z" },
      { wazaName: "mock-waza-name", timestamp: "1999-12-31T15:00:00.000Z" },
      { wazaName: "mock-waza-name", timestamp: "1999-12-31T15:00:00.000Z" },
    ])
  })

  it("inspect sqs client commands", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "3",
      },
    })

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test1",
          ReceiptHandle: "test1",
          Body: "11",
        },
        {
          MessageId: "test2",
          ReceiptHandle: "test2",
          Body: "22",
        },
        {
          MessageId: "test3",
          ReceiptHandle: "test3",
          Body: "33",
        },
      ],
    }
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult)

    // Lambdaハンドラーの実行
    await lambdaHandler()

    const sqsMockCalls = sqsMock.calls()
    expect(sqsMockCalls.length).toEqual(2)

    const calledGetAttributeCommand = sqsMock.commandCalls(
      GetQueueAttributesCommand,
    )
    expect(calledGetAttributeCommand.length).toBe(1)
    expect(calledGetAttributeCommand[0].args[0].input).toEqual({
      AttributeNames: [
        "ApproximateNumberOfMessages",
        "ApproximateNumberOfMessagesNotVisible",
        "ApproximateNumberOfMessagesDelayed",
      ],
      QueueUrl:
        "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
    })

    const calledReceiveMessageCommand = sqsMock.commandCalls(
      ReceiveMessageCommand,
    )
    expect(calledReceiveMessageCommand.length).toBe(1)
    expect(calledReceiveMessageCommand[0].args[0].input).toEqual({
      MaxNumberOfMessages: 10,
      QueueUrl:
        "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
    })
  })
})

describe("recieve-sqs-message.ts w/o mock", () => {
  beforeEach(() => {
    sqsMock.reset()
  })

  it("w/ 3 sqs message", async () => {
    // ダミーのレスポンス定義
    sqsMock.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "3",
      },
    })

    const mockReceiveMessageResult: ReceiveMessageResult = {
      Messages: [
        {
          MessageId: "test1",
          ReceiptHandle: "test1",
          Body: "11",
        },
        {
          MessageId: "test2",
          ReceiptHandle: "test2",
          Body: "22",
        },
        {
          MessageId: "test3",
          ReceiptHandle: "test3",
          Body: "33",
        },
      ],
    }
    sqsMock.on(ReceiveMessageCommand).resolves(mockReceiveMessageResult)

    // Lambdaハンドラーの実行
    const response = await lambdaHandler()

    // レスポンスの値チェック
    const expectedWazaNames = [
      "focus-punch", // きあいパンチ
      "razor-wind", // かまいたち
      "dragon-claw", // ドラゴンクロー
    ]
    response.forEach((item, index) => {
      // わざ名が期待値通りか？
      expect(item.wazaName).toBe(expectedWazaNames[index])
      // タイムスタンプが定義されているか？
      // （タイムスタンプ値比較はズレが発生するので実施しない）
      expect(item.timestamp).toBeDefined()
    })
  })
})
