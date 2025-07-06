import os
from datetime import datetime
from unittest.mock import patch

import boto3
import pytest
from moto import mock_aws


@pytest.fixture()
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"


@pytest.fixture()
def sqs_client(aws_credentials):
    """
    Return a mocked SQS client
    """
    with mock_aws():
        yield boto3.client("sqs")


@pytest.fixture()
def create_sqs_queue(sqs_client) -> str:
    """
    Create a mocked SQS queue
    """
    res = sqs_client.create_queue(QueueName="sample-queue")

    return res.get("QueueUrl")


@pytest.fixture()
def publish_1_sqs_message(sqs_client, create_sqs_queue):
    """
    Publish a message to the mocked SQS queue
    """
    queue_url = create_sqs_queue
    sqs_client.send_message(QueueUrl=queue_url, MessageBody="11")


@pytest.fixture()
def publish_3_sqs_message(sqs_client, create_sqs_queue):
    """
    Publish a message to the mocked SQS queue
    """
    queue_url = create_sqs_queue
    sqs_client.send_message(QueueUrl=queue_url, MessageBody="11")
    sqs_client.send_message(QueueUrl=queue_url, MessageBody="22")
    sqs_client.send_message(QueueUrl=queue_url, MessageBody="33")


@pytest.fixture(autouse=True)
def setup(create_sqs_queue):
    """
    Set up the environment for testing by mocking the SQS queue URL.
    """
    queue_url = create_sqs_queue

    with patch.dict("os.environ", {"QUEUE_URL": queue_url, "API_BASE_URL": "https://pokeapi.co"}):
        yield


@pytest.fixture()
def fixture_get_waza_name(mocker):
    return mocker.patch(
        "src.function.python_function.recieve_sqs_message.index.get_waza_name", return_value="mock-waza-name"
    )


@pytest.fixture()
def fixture_get_now(mocker):
    return mocker.patch(
        "src.function.python_function.recieve_sqs_message.index.get_now", return_value=datetime(2000, 1, 1)
    )
