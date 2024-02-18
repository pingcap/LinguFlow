from resolver import block

from .base import BaseBlock


@block(name="List_Jion_to_Text", kind="data process")
class JoinList(BaseBlock):
    """
    JoinList join a str list to a single str.

    Example:

    ```
    node = JoinList(template="--{input}--", delimiter='\n')

    print(node(["test 1", "text 2", "text 3"]))
    ```

    Will output:

    ```
    --text 1--
    --text 2--
    --text 3--
    ```
    """

    def __init__(self, template: str, delimiter: str = "\n"):
        super(JoinList, self).__init__()
        self.template = template
        self.delimiter = delimiter

    def __call__(self, **kwargs) -> str:
        if len(kwargs) == 0:
            return None

        xs = []
        for t in zip(*kwargs.values()):
            xs.append(self.template.format(**dict(zip(kwargs.keys(), t))))
        return self.delimiter.join(xs)


@block(name="List_Concat_to_List", kind="data process")
class ConcatList(BaseBlock):
    """
    ConcatList concats two str list into one.

    Example:

    ```
    node = ConcatList()
    result = node(["a", "b"], ["1", "2"])
    ```

    The result is `["a", "b", "1", "2"]`.
    """

    def __call__(self, seq1: list, seq2: list) -> list:
        return seq1 + seq2
