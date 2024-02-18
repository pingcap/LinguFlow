from abc import ABC, abstractmethod

from resolver import pattern


@pattern(name="Int_Comparator")
class NumberComparator(ABC):
    """
    An abstract class for comparing integers.

    All classes inherited from this one should take an int and returns a bool.
    """

    def __init__(self): ...

    @abstractmethod
    def __call__(self, input: int) -> bool: ...


@pattern(name="Int_Greater_Or_Equal_Than")
class GreaterOrEqualThan(NumberComparator):
    """
    GreaterOrEqualThan checks if the input number is greater than or equal to the target value.
    """

    def __init__(self, value: int):
        self.value = value

    def __call__(self, input: int) -> bool:
        return input >= self.value


@pattern(name="Int_Less_Or_Equal_Than")
class LessOrEqualThan(NumberComparator):
    """
    LessOrEqualThan checks if the input number is less than or equal to the target value.
    """

    def __init__(self, value: int):
        self.value = value

    def __call__(self, input: int) -> bool:
        return input <= self.value


@pattern(name="Int_Greater_Than")
class GreaterThan(NumberComparator):
    """
    GreaterThan checks if the input number is greater than the target value.
    """

    def __init__(self, value: int):
        self.value = value

    def __call__(self, input: int) -> bool:
        return input > self.value


@pattern(name="Int_Less_Than")
class LessThan(NumberComparator):
    """
    LessThan checks if the input number is less than the target value.
    """

    def __init__(self, value: int):
        self.value = value

    def __call__(self, input: int) -> bool:
        return input < self.value


@pattern(name="Int_Equal_To")
class EqualWithNumber(NumberComparator):
    """
    EqualWithNumber checks if the input number is equal to the target value.
    """

    def __init__(self, value: int):
        self.value = value

    def __call__(self, input: int) -> bool:
        return input == self.value


@pattern(name="Text_Comparator")
class TextComparator(ABC):
    """
    An abstract class for comparing texts.

    All classes inherited from this one should take a text and returns a bool.
    """

    def __init__(self): ...

    @abstractmethod
    def __call__(self, input: str) -> bool: ...


@pattern(name="Text_Equal_With")
class TextEqual(TextComparator):
    """
    TextEqual checks if the input text is equal to the target value.
    """

    def __init__(self, value: str):
        self.value = value

    def __call__(self, input: str) -> bool:
        return input == self.value


@pattern(name="Text_Contains")
class TextContains(TextComparator):
    """
    TextContains checks if input text contains specified sub string.
    """

    def __init__(self, value: str):
        self.value = value

    def __call__(self, input: str) -> bool:
        return self.value in input


@pattern(name="Text_Has_Prefix")
class TextHasPrefix(TextComparator):
    """
    TextHasPrefix checks if input text has specified prefix.
    """

    def __init__(self, value: str):
        self.value = value

    def __call__(self, input: str) -> bool:
        return input.startswith(self.value)


@pattern(name="Text_Has_Suffix")
class TextHasSuffix(TextComparator):
    """
    TextHasSuffix checks if input text has specified suffix.
    """

    def __init__(self, value: str):
        self.value = value

    def __call__(self, input: str) -> bool:
        return input.endswith(self.value)


@pattern(name="List_Comparator")
class ListComparator(ABC):
    """
    An abstract class for comparing lists.

    All classes inherited from this one should take a list and returns a bool.
    """

    def __init__(self): ...

    @abstractmethod
    def __call__(self, input: list) -> bool: ...


@pattern(name="List_Contains")
class ListContains(ListComparator):
    """
    ListContains checks if input list contains specified text.
    """

    def __init__(self, value: str):
        self.value = value

    def __call__(self, input: list) -> bool:
        return self.value in input


@pattern(name="List_Is_Empty")
class ListIsEmpty(ListComparator):
    """
    ListIsEmpty checks if input list is empty.
    """

    def __call__(self, input: list) -> bool:
        return len(input) == 0
