from resolver import block

from .base import BaseBlock


@block(name="Text_Join_to_Dict", kind="data process")
class ComposeDict(BaseBlock):
    """
    ComposeDict compose multiple str into a dict.

    Example:

    ```
    node = ComposeDict()
    result = node(name="foo", value="bar", comment="barz")
    ```

    The result: `{"name": "foo", "value": "bar", "comment": "barz"}`
    """

    def __call__(self, **kwargs) -> dict:
        return kwargs


@block(name="Text_split_to_List", kind="data process")
class ListParser(BaseBlock):
    """
    ListParser split a str into str list.

    Example:

    ```
    node = ListParser(delim=",")
    result = node("a,b,c")
    ```

    The result will be `["a", "b", "c"]`
    """

    def __init__(self, delim: str, prefix="", suffix=""):
        super(ListParser, self).__init__()
        self.delim = delim
        self.prefix = prefix
        self.suffix = suffix

    def __call__(self, text: str) -> list:
        text = text.strip().lstrip(self.prefix).rstrip(self.suffix)
        return [t.strip() for t in text.split(self.delim) if t.strip()]
