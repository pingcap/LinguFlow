import contextvars
from abc import abstractmethod
from typing import Any, Callable


class BaseBlock(Callable):
    """
    An abstract class for DAG block.

    A block defines the code template of DAG nodes.
    """

    # the global context for all blocks
    _ctx = contextvars.ContextVar("context")

    def __init__(self):
        pass

    @property
    def context(self) -> dict:
        return self._ctx.get({})

    @property
    def is_input(self) -> bool:
        return False

    @property
    def is_output(self) -> bool:
        return False


class InputBlock(BaseBlock):
    """
    An abstract class for input block. Input block is a special block for the DAG:
    there should be exactly one input block in the DAG. It's the entry point of the
    graph.
    """

    @property
    def is_input(self) -> bool:
        return True

    @abstractmethod
    def input(self, inputs: Any) -> None: ...


class OutputBlock(BaseBlock):
    """
    An abstract class for output block. Output block is a special block for the DAG:
    there should be exactly one output block in the DAG. It's the exit point of the
    graph.
    """

    @property
    def is_output(self):
        return True
