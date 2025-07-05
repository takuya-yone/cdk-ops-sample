import * as cdk from "aws-cdk-lib"
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as node_lambda,
  aws_sqs as sqs,
} from "aws-cdk-lib"
import { Construct } from "constructs"
import { CustomNodejsFunction } from "../custom-resource"

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

    const layer = new lambda.LayerVersion(this, "SampleNodejsLayer", {
      layerVersionName: "SampleNodejsLayer",
      code: lambda.Code.fromAsset("src/layer/nodejs-layer"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const _nodeLambda = new CustomNodejsFunction(this, "custom-nodejs-lambda", {
      functionName: "custom-nodejs-lambda",
      entry: "src/function/recieve-sqs-message.ts",
      role: lambdaRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        QUEUE_URL: sampleQueue.queueUrl,
        API_BASE_URL: "https://pokeapi.co",
      },
      layers: [layer],
    })

    const _nodeLambda2 = new node_lambda.NodejsFunction(this, "nodejs-lambda", {
      functionName: "nodejs-lambda",
      entry: "src/function/recieve-sqs-message.ts",
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
      layers: [layer],
    })
  }
}
