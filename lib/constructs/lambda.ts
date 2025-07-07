import {
  PythonFunction,
  PythonLayerVersion,
} from "@aws-cdk/aws-lambda-python-alpha"
import * as cdk from "aws-cdk-lib"
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as node_lambda,
  aws_sqs as sqs,
} from "aws-cdk-lib"
import { Construct } from "constructs"
import { CustomNodejsFunction, CustomPythonFunction } from "../custom-resource"

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const sampleQueue = new sqs.Queue(this, "sample-queue", {
      queueName: "sample-queue",
      visibilityTimeout: cdk.Duration.seconds(30),
    })

    const lambdaRole = new iam.Role(this, "sample-lambda-role", {
      roleName: "sample-lambda-role",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
      ],
      inlinePolicies: {},
    })
    sampleQueue.grantConsumeMessages(lambdaRole)

    const nodejsLayer = new lambda.LayerVersion(this, "SampleNodejsLayer", {
      layerVersionName: "SampleNodejsLayer",
      code: lambda.Code.fromAsset("src/layer/nodejs-layer"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const _customNodeLambda = new CustomNodejsFunction(
      this,
      "custom-nodejs-lambda",
      {
        functionName: "custom-nodejs-lambda",
        entry: "src/function/nodejs-function/recieve-sqs-message.ts",
        role: lambdaRole,
        memorySize: 128,
        timeout: cdk.Duration.seconds(10),
        environment: {
          QUEUE_URL: sampleQueue.queueUrl,
          API_BASE_URL: "https://pokeapi.co",
        },
        layers: [nodejsLayer],
      },
    )

    const _nodeLambda = new node_lambda.NodejsFunction(this, "nodejs-lambda", {
      functionName: "nodejs-lambda",
      entry: "src/function/nodejs-function/recieve-sqs-message.ts",
      handler: "lambdaHandler",
      runtime: lambda.Runtime.NODEJS_22_X,
      tracing: lambda.Tracing.ACTIVE,
      architecture: lambda.Architecture.ARM_64,
      role: lambdaRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        QUEUE_URL: sampleQueue.queueUrl,
        API_BASE_URL: "https://pokeapi.co",
      },
      layers: [nodejsLayer],
    })

    const pythonLayer = new PythonLayerVersion(this, "SamplePythonLayer", {
      entry: "src/layer/python_layer",
      layerVersionName: "SamplePythonLayer",
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_13],
      compatibleArchitectures: [cdk.aws_lambda.Architecture.ARM_64],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const pythonPowertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "PythonPowertoolsLayer",
      "arn:aws:lambda:ap-northeast-1:017000801446:layer:AWSLambdaPowertoolsPythonV3-python313-arm64:18",
    )

    const _customPythonLambda = new CustomPythonFunction(
      this,
      "custom-python-lambda",
      {
        functionName: "custom-python-lambda",
        entry: "src/function/python_function/recieve_sqs_message",
        role: lambdaRole,
        memorySize: 128,
        timeout: cdk.Duration.seconds(10),
        environment: {
          QUEUE_URL: sampleQueue.queueUrl,
          API_BASE_URL: "https://pokeapi.co",
        },
        layers: [pythonLayer, pythonPowertoolsLayer],
      },
    )

    const _pythonLambda = new PythonFunction(this, "python-lambda", {
      functionName: "python-lambda",
      entry: "src/function/python_function/recieve_sqs_message",
      runtime: lambda.Runtime.PYTHON_3_13,
      bundling: { assetExcludes: ["__pycache__", "test"] },
      handler: "lambda_handler",
      tracing: lambda.Tracing.ACTIVE,
      retryAttempts: 0,
      architecture: lambda.Architecture.ARM_64,
      role: lambdaRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        QUEUE_URL: sampleQueue.queueUrl,
        API_BASE_URL: "https://pokeapi.co",
      },
      layers: [pythonLayer, pythonPowertoolsLayer],
    })
  }
}
