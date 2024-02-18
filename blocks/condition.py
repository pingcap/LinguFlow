from patterns import ListComparator, NumberComparator, TextComparator
from resolver import block

from .base import BaseBlock


@block(name="Int_Condition", kind="condition")
class NumberCondition(BaseBlock):
    """
    NumberCondition checks if the input number meets some conditions.

    Example:

    ```
    node = NumberCondition(GreaterOrEqualThan(0))
    assert node(0)
    ```
    """

    def __init__(self, comparator: NumberComparator):
        self.comparator = comparator

    def __call__(self, input: int) -> bool:
        return self.comparator(input)


@block(name="Text_Condition", kind="condition")
class TextCondition(BaseBlock):
    """
    TextCondition checks if the input text meets some conditions.

    Example:

    ```
    node = TextCondition(TextContains("good"))
    assert node("good boy")
    ```
    """

    def __init__(self, comparator: TextComparator):
        self.comparator = comparator

    def __call__(self, input: str) -> bool:
        return self.comparator(input)


@block(name="List_Condition", kind="condition")
class ListCondition(BaseBlock):
    """
    ListCondition checks if the input list meets some conditions.

    Example:

    ```
    node = ListCondition(ListIsEmpty())
    assert node([])
    ```
    """

    def __init__(self, comparator: ListComparator):
        self.comparator = comparator

    def __call__(self, input: list) -> bool:
        return self.comparator(input)
