import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";

export class NetworkConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const _vpc = new ec2.Vpc(this, "sample-vpc", {
      vpcName: "sample-vpc",
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2,
      enableDnsSupport: false,
      enableDnsHostnames: false,
      flowLogs: {
        rejectLogs: {
          trafficType: ec2.FlowLogTrafficType.REJECT,
          maxAggregationInterval: ec2.FlowLogMaxAggregationInterval.ONE_MINUTE,
        },
      },
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private-isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
