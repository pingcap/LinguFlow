from resolver import pattern


@pattern(name="Secret")
class Secret(str):
    """
    A dummy type used to tell the UI that this data is sensitive (such as passwords, API keys, etc.).
    """

    def __new__(cls, plaintext: str):
        return str.__new__(cls, plaintext)

    def __init__(self, plaintext: str):
        pass
