import time

from patterns import Secret
from resolver import block

from .base import BaseBlock


@block(name="Sleep", kind="dummy")
class Sleep(BaseBlock):
    def __init__(self, time: int, sec: Secret):
        self.time = time
        self.sec = sec

    def __call__(self, input: str) -> str:
        time.sleep(self.time)
        return str(self.sec)
