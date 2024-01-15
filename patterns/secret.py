from resolver import pattern


@pattern(name="Secret")
class Secret(str):
    def __new__(cls, plaintext: str):
        return str.__new__(cls, plaintext)

    def __init__(self, plaintext: str):
        pass