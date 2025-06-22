#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MyResourceChecker } from "../lib/aspects/policy";
import { CdkOpsSampleStack } from "../lib/stack/cdk-ops-sample-stack";

const app = new cdk.App();

cdk.Aspects.of(app).add(new MyResourceChecker());

new CdkOpsSampleStack(app, "CdkOpsSampleStack", {});

cdk.Tags.of(app).add("Project", "cdk-ops-sample");
