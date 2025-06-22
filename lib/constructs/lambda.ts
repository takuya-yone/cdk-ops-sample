import { Construct } from "constructs";
import { CustomNodejsFunction } from "../custom-resource";
import * as cdk from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";

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

		const nodeLambda = new CustomNodejsFunction(this, "custom-nodejs-lambda", {
			functionName: "custom-nodejs-lambda",
			entry: "src/lambda/list-s3.ts",
			role: lambdaRole,
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
		});
	}
}
