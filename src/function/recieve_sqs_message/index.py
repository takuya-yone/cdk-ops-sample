import boto3
import botocore

try:
    from date_utils import get_now
except ImportError:
    from src.layer.python_layer.date_utils import get_now


s3_client = boto3.client("s3")


def lambda_handler(event, context):
    buckets = s3_client.list_buckets()
    print(f"Buckets: {buckets}")
    print(f"boto3 version: {boto3.__version__}")
    print(f"botocore version: {botocore.__version__}")
    print(f"now: {get_now()}")
    return {"statusCode": 200, "body": "Hello from Lambda!"}
