from typing import List

from resolver import block

from .base import InputBlock


@block(name="Text_Input", kind="input & output")
class TextInput(InputBlock):
    """
    A input block that accepts a text as the DAG input.
    """

    def input(self, text: str):
        self.text = text

    def __call__(self) -> str:
        return self.text


@block(name="List_Input", kind="input & output")
class ListInput(InputBlock):
    """
    A input block that accpets a list of texts as the DAG input.
    """

    def input(self, messages: list):
        self.messages = messages

    def __call__(self) -> list:
        return self.messages


@block(name="Dict_Input", kind="input & output")
class DictInput(InputBlock):
    """
    A input block that accept a dict of texts (both key and values are texts)
    as the DAG input.
    """

    def input(self, messages: dict):
        self.messages = messages

    def __call__(self) -> dict:
        return self.messages
