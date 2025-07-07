import os

import boto3
import requests
from aws_lambda_powertools import Logger, Tracer

try:
    # Lambdaデプロイ時のパス
    from date_utils import get_now
except ImportError:
    # ローカル実行時のパス
    from src.layer.python_layer.date_utils import get_now


sqs_client = boto3.client("sqs")

QUEUE_URL = os.getenv("QUEUE_URL")
API_BASE_URL = os.getenv("API_BASE_URL")

logger = Logger()
tracer = Tracer()


@tracer.capture_method
def get_waza_name(machine_id: str) -> str:
    """
    Get the name of the Waza (skill) being executed.
    """
    response = requests.get(f"{API_BASE_URL}/api/v2/machine/{machine_id}")

    return response.json().get("move").get("name", "Unknown Waza Name")


@tracer.capture_lambda_handler
def lambda_handler(event, context) -> list:
    sqs_attribute = sqs_client.get_queue_attributes(
        QueueUrl=QUEUE_URL,
        AttributeNames=[
            "ApproximateNumberOfMessages",
            "ApproximateNumberOfMessagesNotVisible",
            "ApproximateNumberOfMessagesDelayed",
        ],
    )

    if sqs_attribute["Attributes"]["ApproximateNumberOfMessages"] == "0":
        logger.info(f"No messages in the queue.: {get_now().isoformat()}")
        return []

    sqs_messages = sqs_client.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=10,
    )

    result = map(
        lambda message: {"waza_name": get_waza_name(
            message["Body"]), "timestamp": get_now().isoformat()},
        sqs_messages.get("Messages", []),
    )

    # メッセージを削除
    delete_message_entries = [
        {"Id": message["MessageId"], "ReceiptHandle": message["ReceiptHandle"]}
        for message in sqs_messages.get("Messages", [])
    ]
    sqs_client.delete_message_batch(
        QueueUrl=QUEUE_URL, Entries=delete_message_entries)

    return list(result)
