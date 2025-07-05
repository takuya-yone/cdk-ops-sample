import { Annotations, aws_ec2 as ec2 } from "aws-cdk-lib"
import type { IConstruct } from "constructs"

export function checkVpc(node: IConstruct): void {
  if (node instanceof ec2.Vpc) {
    if (node.publicSubnets.length !== 0) {
      Annotations.of(node).addError("public subnets are prohibited!!!")
    }
  }
}
