from typing import List

from resolver import block

from .base import OutputBlock


@block(name="Text_Output", kind="input & output")
class TextOutput(OutputBlock):
    """
    A output block that accept text as input, and use the same text as the DAG output.
    """

    def __call__(self, input: str, **ignore) -> str:
        return input
