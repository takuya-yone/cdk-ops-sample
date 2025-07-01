import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
  DatastoreConstruct,
  LambdaConstruct,
  NetworkConstruct,
} from "../constructs";

export class CdkOpsSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const _datastoreConstruct = new DatastoreConstruct(
      this,
      "DatastoreConstruct"
    );

    const _lambdaConstruct = new LambdaConstruct(this, "LambdaConstruct");

    const _networkConstruct = new NetworkConstruct(this, "NetworkConstruct");
  }
}
