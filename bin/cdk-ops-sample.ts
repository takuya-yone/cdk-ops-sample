#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import { CdkOpsSampleStack } from "../lib/stack/cdk-ops-sample-stack"

const app = new cdk.App()

new CdkOpsSampleStack(app, "CdkOpsSampleStack", {})

// cdk.Aspects.of(app).add(new ComplianceChecker());

cdk.Tags.of(app).add("Project", "cdk-ops-sample")
