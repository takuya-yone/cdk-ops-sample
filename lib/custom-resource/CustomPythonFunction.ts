import type { PythonFunctionProps } from "@aws-cdk/aws-lambda-python-alpha";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { aws_lambda as lambda } from "aws-cdk-lib";
import type { Construct } from "constructs";

type OptionalField =
  | "runtime"
  | "bundling"
  | "handler"
  | "tracing"
  | "retryAttempts"
  | "architecture";

type CustomPythonFunctionProps = Omit<PythonFunctionProps, OptionalField>;

export class CustomPythonFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: CustomPythonFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_13,
      bundling: { assetExcludes: ["__pycache__", "test"] },
      handler: "lambda_handler",
      tracing: lambda.Tracing.ACTIVE,
      retryAttempts: 0,
      architecture: lambda.Architecture.ARM_64,
    });
  }
}
