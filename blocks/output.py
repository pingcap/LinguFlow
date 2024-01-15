from typing import List
from resolver import block

from .base import OutputBlock


@block(name="Output", kind="output")
class TextOutput(OutputBlock):
    def __call__(self, input: str, **ignore) -> str:
        return input