from typing import List
from resolver import block

from .base import InputBlock


@block(name="TextInput", kind="input")
class TextInput(InputBlock):
    def input(self, text: str):
        self.text = text

    def __call__(self) -> str:
        return self.text


@block(name="ListInput", kind="input")
class ListInput(InputBlock):
    def input(self, messages: list):
        self.messages = messages

    def __call__(self) -> list:
        return self.messages


@block(name="DictInput", kind="input")
class DictInput(InputBlock):
    def input(self, messages: dict):
        self.messages = messages

    def __call__(self) -> dict:
        return self.messages