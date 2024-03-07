from resolver import block

from .base import BaseBlock


@block(name="Dict_KeySelect_to_Text", kind="data process")
class KeySelector(BaseBlock):
    """
    KeySelector select value from str dict and returns a str.

    Example:

    ```
    node = KeySelector(key="foo")
    result = node({"foo": "bar"})
    ```

    The result will be `"bar"`.
    """

    def __init__(self, key: str):
        super(KeySelector, self).__init__()
        self.key = key

    def __call__(self, messages: dict) -> str:
        return messages.get(self.key)
