import type { PythonFunctionProps } from "@aws-cdk/aws-lambda-python-alpha"
// biome-ignore lint/style/noRestrictedImports: for declaration
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha"
import {
  aws_lambda as lambda,
  aws_logs as logs,
  RemovalPolicy,
} from "aws-cdk-lib"
import type { Construct } from "constructs"

type OptionalField =
  | "runtime"
  | "bundling"
  | "handler"
  | "tracing"
  | "retryAttempts"
  | "architecture"

type CustomPythonFunctionProps = Omit<PythonFunctionProps, OptionalField>

export class CustomPythonFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: CustomPythonFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_13,
      bundling: { assetExcludes: ["__pycache__", "test"] },
      handler: "lambda_handler",
      tracing: lambda.Tracing.ACTIVE,
      retryAttempts: 0,
      logGroup: new logs.LogGroup(scope, `${props.functionName}-logs`, {
        logGroupName: `/aws/lambda/${props.functionName}-logs`,
        retention: logs.RetentionDays.ONE_YEAR,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      architecture: lambda.Architecture.ARM_64,
    })
  }
}
