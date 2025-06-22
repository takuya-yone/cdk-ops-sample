from datetime import datetime
from zoneinfo import ZoneInfo


def get_now():
    """
    現在時刻を取得して返す

    タイムゾーンは Asia/Tokyo とする
    """
    return datetime.now(ZoneInfo("Asia/Tokyo"))
