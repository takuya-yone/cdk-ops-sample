from moto import mock_aws


@mock_aws
def test_lambda_handler(mocker, create_s3_bucket):
    """
    handlerのテスト
    """
    from src.function.list_s3 import lambda_handler

    res = lambda_handler({}, {})

    assert res["statusCode"] == 200
    assert res["body"] == "Hello from Lambda!"
