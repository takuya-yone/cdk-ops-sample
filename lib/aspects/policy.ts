import type { IAspect } from "aws-cdk-lib"
import type { IConstruct } from "constructs"
import { checkVpc } from "./vpc"

export class MyResourceChecker implements IAspect {
  public visit(node: IConstruct): void {
    checkVpc(node)
  }
}
