from src.layer.python_layer.date_utils import get_now
from datetime import datetime


class TestDateUtils:
    def test_get_date(self):

        date = get_now()
        assert isinstance(date, datetime)
