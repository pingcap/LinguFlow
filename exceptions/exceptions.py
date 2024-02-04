from typing import Set


class NodeException(Exception):
    """
    Exceptions raised from a DAG node.

    Usage:

    ```
    try:
        node.run(...)
    except Exception as e:
        raise NodeException(node.id) from e
    ```
    """
    def __init__(self, node_id: str):
        self.node_id = node_id


class DuplicatedNameError(Exception):
    """
    DuplicatedNameError indicates that two different blocks have the same name.
    """
    def __init__(self, name: str):
        super(DuplicatedNameError, self).__init__(f"name {name} is duplicated")


class DuplicatedTypeError(Exception):
    """
    DuplicatedTypeError indicates that the same block class has been registered 
    multiple times with different names.
    """
    def __init__(self, typ: type):
        super(DuplicatedTypeError, self).__init__(f"type {typ} is duplicated")


class UnregisteredError(Exception):
    """
    UnregisteredError indicates that a name (patterns) is required by other code (blocks/patterns), 
    but no class is registered with that name.
    """
    def __init__(self, ref_name: str, cls: type):
        super(UnregisteredError, self).__init__(
            f"type {cls} not registered, referenced by {ref_name}",
        )


class ApplicationNotFound(Exception):
    """
    ApplicationNotFound indicates that the specified application is not found in database.
    """
    def __init__(self, application_id: str):
        self.application_id = application_id

    def __str__(self):
        return f"application {self.application_id} not found"


class NoActiveVersion(Exception):
    """
    NoActiveVersion indicates that the specified application has no acitve version.
    """
    def __init__(self, application_id: str):
        self.application_id = application_id

    def __str__(self):
        return f"application {self.application_id} has no active version"


class VersionnNotFound(Exception):
    """
    VersionnNotFound indicates that the specified version not found in database.
    """
    def __init__(self, version_id: str):
        self.version_id = version_id

    def __str__(self):
        return f"version {self.version_id} not found"


class InteractionNotFound(Exception):
    """
    InteractionNotFound indicates that the specified iteraction not found in database.
    """
    def __init__(self, interaction_id: str):
        self.interaction_id = interaction_id

    def __str__(self):
        return f"interaction {self.interaction_id} not found"


class InvokeError(Exception):
    """
    InvokeError is used in invoke blocks.

    Invoke blocks try to invoke other apps and return the result, when there is
    any error, raise InvokeError.
    """
    def __init__(
        self, application_id: str, code: str, message: str, node_id: str = None
    ):
        self.application_id = application_id
        self.code = code
        self.message = message
        self.node_id = node_id

    def __str__(self):
        return f"invoke encounter error on application {self.application_id}: {self.message}"


class GraphCheckError(Exception):
    """
    An abstract class for graph validation.

    When a new graph is submitted, a list of checks will be performed. If any check fails,
    an exception inherited from GraphCheckError will be raised.
    """
    ...




class NodeConstructError(Exception):
    """
    When DAG node construction fails, NodeConstructError will be raised.
    """
    ...