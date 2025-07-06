import boto3
import botocore
import os
import requests

try:
    # Lambdaデプロイ時のパス
    from date_utils import get_now
except ImportError:
    # ローカル実行時のパス
    from src.layer.python_layer.date_utils import get_now


sqs_client = boto3.client("sqs")

QUEUE_URL = os.getenv('QUEUE_URL')
API_BASE_URL = os.getenv('API_BASE_URL')


def get_waza_name(machine_id: str) -> str:
    """
    Get the name of the Waza (skill) being executed.
    """
    response = requests.get(f'{API_BASE_URL}/api/v2/machine/{machine_id}')

    return response.json().get('move').get('name', 'Unknown Waza Name')


def lambda_handler(event, context) -> list:
    sqs_attribute = sqs_client.get_queue_attributes(
        QueueUrl=QUEUE_URL,
        AttributeNames=[
            "ApproximateNumberOfMessages",
            "ApproximateNumberOfMessagesNotVisible",
            "ApproximateNumberOfMessagesDelayed"
        ]
    )
    
    if(sqs_attribute['Attributes']['ApproximateNumberOfMessages'] == '0'):
        return []
    
    sqs_messages = sqs_client.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=10,
    )
    
    result = map(lambda message: {'waza_name': get_waza_name(message['Body']), 'timestamp': get_now().isoformat()}, sqs_messages.get('Messages', []))
    
    return list(result)
