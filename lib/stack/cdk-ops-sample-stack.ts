import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaConstruct, NetworkConstruct } from "../constructs";

export class CdkOpsSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaConstruct = new LambdaConstruct(this, "LambdaConstruct", {});

    const networkConstruct = new NetworkConstruct(this, "NetworkConstruct", {});
  }
}
