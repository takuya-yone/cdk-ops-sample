#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import { MyResourceChecker } from "../lib/aspects/policy"
import { CdkOpsSampleStack } from "../lib/stack/cdk-ops-sample-stack"

const app = new cdk.App()

new CdkOpsSampleStack(app, "CdkOpsSampleStack", {})

// cdk.Aspects.of(app).add(new MyResourceChecker());

cdk.Tags.of(app).add("Project", "cdk-ops-sample")
