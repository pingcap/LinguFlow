from typing import Any
from typing import Callable
from abc import abstractmethod


class BaseBlock(Callable):
    def __init__(self):
        ...

    def __str__(self) -> str:
        ...

    @property
    def is_input(self) -> bool:
        return False

    @property
    def is_output(self) -> bool:
        return False


class InputBlock(BaseBlock):
    @property
    def is_input(self) -> bool:
        return True

    @abstractmethod
    def input(self, inputs: Any) -> None:
        ...


class OutputBlock(BaseBlock):
    @property
    def is_output(self):
        return True