from typing import Set


class NodeException(Exception):
    def __init__(self, node_id: str):
        self.node_id = node_id


class DuplicatedNameError(Exception):
    def __init__(self, name: str):
        super(DuplicatedNameError, self).__init__(f"name {name} is duplicated")


class DuplicatedTypeError(Exception):
    def __init__(self, typ: type):
        super(DuplicatedTypeError, self).__init__(f"type {typ} is duplicated")


class UnregisteredError(Exception):
    def __init__(self, ref_name: str, cls: type):
        super(UnregisteredError, self).__init__(
            f"type {cls} not registered, referenced by {ref_name}",
        )


class InvalidCode(Exception):
    def __init__(self, code):
        super(InvalidCode, self).__init__()
        self.code = code

    def __str__(self):
        return f"invalid code: {self.code}"


class InvalidToken(Exception):
    def __init__(self, token):
        super(InvalidToken, self).__init__()
        self.token = token

    def __str__(self):
        return f"invalid token: {self.token}"


class InvalidCredentials(Exception):
    def __init__(self, access_key: str, access_secret: str):
        super(InvalidCredentials, self).__init__()
        self.access_key = access_key
        self.access_secret = access_secret

    def __str__(self):
        return f"invalid credentials, access_key: {self.access_key}"


class ApplicationNotFound(Exception):
    def __init__(self, application_id: str):
        self.application_id = application_id

    def __str__(self):
        return f"application {self.application_id} not found"


class InteractionNotFound(Exception):
    def __init__(self, interaction_id: str):
        self.interaction_id = interaction_id

    def __str__(self):
        return f"interaction {self.interaction_id} not found"


class ApplicationInputTypeMismatch(Exception):
    def __init__(self, exp: type, got: type):
        self.exp = exp
        self.got = got

    def __str__(self):
        return f"the application expect {self.exp} as input, got {self.got}"


class InvalidParameters(Exception):
    def __init__(self, parameters: Set[str]):
        self.parameters = parameters

    def __str__(self):
        return f"invalid parameters: {', '.join(self.parameters)}"


class TypeNameResolveError(Exception):
    def __init__(self, name: str):
        self.name = name

    def __str__(self):
        return f"type {self.name} is not supported"


class PluginNotFoundError(Exception):
    def __init__(self, plugin: str):
        self.plugin = plugin

    def __str__(self):
        return f"plugin {self.plugin} not found"


class InvokeError(Exception):
    def __init__(
        self, application_id: str, code: str, message: str, node_id: str = None
    ):
        self.application_id = application_id
        self.code = code
        self.message = message
        self.node_id = node_id

    def __str__(self):
        return f"invoke encounter error on application {self.application_id}: {self.message}"


class ParameterMissing(Exception):
    def __init__(parameter: str):
        self.parameter = parameter

    def __str__(self):
        return f"missing parameter `{self.parameter}`"


class GraphCheckError(Exception):
    ...


class EmbeddingError(Exception):
    ...


class EmbeddingServiceError(Exception):
    ...


class NodeConstructError(Exception):
    ...


class LoggerNotAvailable(Exception):
    ...
