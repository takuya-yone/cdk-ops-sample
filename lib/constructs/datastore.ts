import { aws_s3 as s3 } from "aws-cdk-lib"
import { Construct } from "constructs"

export class DatastoreConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const _versionedBucket = new s3.Bucket(this, "sample-bucket-versioned", {
      versioned: true,
    })

    const _notVersionedBucket = new s3.Bucket(
      this,
      "sample-bucket-not-versioned",
      {
        versioned: false,
      },
    )
  }
}
