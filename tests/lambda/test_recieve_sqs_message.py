from moto import mock_aws
from unittest.mock import patch



class TestWithMock:
    @mock_aws
    def test_lambda_handler_with_0_message(mocker, create_sqs_queue):
        """
        handlerのテスト（キューにメッセージが0件）
        """
        from src.function.recieve_sqs_message.index import lambda_handler

        res = lambda_handler({}, {})

        assert res == []
        
        
    @mock_aws
    def test_lambda_handler_with_1_message(mocker, fixture_get_waza_name, fixture_get_now, publish_1_sqs_message):
        """
        handlerのテスト（キューにメッセージが1件）
        """
        from src.function.recieve_sqs_message.index import lambda_handler


        res = lambda_handler({}, {})
        
        expected = [{'waza_name': 'mock-waza-name', 'timestamp': '2000-01-01T00:00:00'}]

        assert res == expected
        
        
    @mock_aws
    def test_lambda_handler_with_3_message(mocker, fixture_get_waza_name, fixture_get_now, publish_3_sqs_message):
        """
        handlerのテスト（キューにメッセージが3件）
        """
        from src.function.recieve_sqs_message.index import lambda_handler

        res = lambda_handler({}, {})

        expected = [
            {'waza_name': 'mock-waza-name', 'timestamp': '2000-01-01T00:00:00'},
            {'waza_name': 'mock-waza-name', 'timestamp': '2000-01-01T00:00:00'},
            {'waza_name': 'mock-waza-name', 'timestamp': '2000-01-01T00:00:00'}
        ]

        assert res == expected
        

class TestWithoutMock:
    @mock_aws
    def test_lambda_handler_with_3_message(mocker, publish_3_sqs_message):
        """
        handlerのテスト（キューにメッセージが3件）
        """
        from src.function.recieve_sqs_message.index import lambda_handler

        res = lambda_handler({}, {})

        expected_waza_names = [
            "focus-punch", # きあいパンチ
            "razor-wind", # かまいたち
            "dragon-claw", # ドラゴンクロー
        ]
        
        # わざ名が一致していることを確認
        # （タイムスタンプ値比較はズレが発生するので実施しない）
        for index,item in enumerate(res):
            assert item['waza_name'] == expected_waza_names[index]