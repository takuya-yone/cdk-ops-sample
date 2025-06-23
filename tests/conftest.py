import os

import boto3
import pytest
from moto import mock_aws


@pytest.fixture()
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"


@pytest.fixture()
def s3_client(aws_credentials):
    """
    Return a mocked S3 resource client
    """
    with mock_aws():
        yield boto3.client("s3")


@pytest.fixture()
def create_s3_bucket(s3_client):
    """
    Create a mocked S3 bucket
    """
    s3_client.create_bucket(Bucket="test-bucket-1")
    s3_client.create_bucket(Bucket="test-bucket-2")
