import * as cdk from "aws-cdk-lib";
import { aws_iam as iam, aws_lambda_nodejs as node_lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomNodejsFunction } from "../custom-resource";

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

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
    });

    const _nodeLambda = new CustomNodejsFunction(this, "custom-nodejs-lambda", {
      functionName: "custom-nodejs-lambda",
      entry: "src/function/list-s3.ts",
      role: lambdaRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
    });

    const _nodeLambda2 = new node_lambda.NodejsFunction(this, "nodejs-lambda", {
      functionName: "nodejs-lambda",
      entry: "src/function/list-s3.ts",
      role: lambdaRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
    });
  }
}
