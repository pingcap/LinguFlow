import functools
import json
import threading
import time
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union

from environs import Env
from sqlalchemy import create_engine

from database import Database
from exceptions import (
    ApplicationInputTypeMismatch,
    ApplicationNotFound,
    AsyncExceptionHandler,
    InteractionError,
    InteractionNotFound,
    NoActiveVersion,
    NodeConstructError,
    VersionnNotFound,
    register_exception_handlers,
)
from model import Interaction
from observability import langfuse, span, trace
from resolver import Resolver, block
from scheduler import Edge, Graph

from .base import BaseBlock


class AsyncInvoker:
    """
    AsyncInvoker invokes an application with specified input, and returns an
    interaction id, which can be used for polling the result later.

    Example:

    ```
    invoker = AsyncInvoker(Database(...))
    interaction_id = invoker.invoke(user="...", app_id="...", input=...)

    result = None
    while not result:
        # Poll the interaction until the result is available
        interaction = invoker.poll(interaction_id)
        result = interaction.output
        # sleep some time here
    ```
    """

    def __init__(self, database: Database):
        self.resolver = Resolver()
        self.database = database

    def construct_graph_node(self, config: dict) -> BaseBlock:
        """
        Construct a graph node based on the given configuration.

        Args:
            config (dict): The configuration dictionary containing information about the node.

        Returns:
            BaseBlock: An instance of the constructed graph node.

        Raises:
            NodeConstructError: If there is an error during node construction.
        """
        name = config["name"]
        cls = self.resolver.lookup(name)
        if cls is None:
            raise NodeConstructError(f"name {name} not found")
        elif self.resolver.is_abstract(cls):
            raise NodeConstructError(
                f"{name} is an abstract type and can NOT be constructed"
            )
        properties = {}
        if not isinstance(config, dict):
            slots = config.slots
            if slots is None:
                slots = {}
        else:
            slots = config.get("slots") or {}
        for p, v in slots.items():
            if isinstance(v, dict):
                properties[p] = self.construct_graph_node(v)
            elif isinstance(v, list):
                properties[p] = [
                    self.construct_graph_node(x) if isinstance(x, dict) else x
                    for x in v
                ]
            else:
                properties[p] = v

        try:
            return cls(**properties)
        except Exception as e:
            raise NodeConstructError(f"construct {name} failed: {str(e)}") from e

    def initialize_graph(
        self, configuration: dict, skip_validation: bool = False
    ) -> Graph:
        """
        Initialize a graph based on the given configuration.

        Args:
            configuration (dict): The configuration for the graph, including nodes and edges.
            skip_validation (bool, optional): Whether to skip validation of the graph. Defaults to False.

        Returns:
            Graph: The initialized graph.
        """
        edges = []
        for edge in configuration["edges"]:
            edges.append(
                Edge(
                    source=edge.get("src_block"),
                    sink=edge.get("dst_block"),
                    port=edge.get("dst_port"),
                    case=edge.get("case"),
                )
            )
        nodes = {}
        for node in configuration["nodes"]:
            nodes[node.get("id")] = self.construct_graph_node(node)
        return Graph(nodes, edges, skip_validation)

    def invoke(
        self,
        user: str,
        app_id: str,
        input: Union[str, dict, list],
        version_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> str:
        """
        Invoke the specified application with the given input.

        Args:
            input (Union[str, dict, list]): The input data for the application,
                which can be a string, dictionary, or list.
            app_id (str): The ID of the application to invoke.
            version_id (str): The version to invoke, by default the active_version of
                the application will be used.

        Returns:
            str: The ID of the interaction created for this invocation.
        """
        app = self.database.get_application(app_id)
        if not app:
            raise ApplicationNotFound(app_id)
        if not version_id:
            if not app.active_version:
                raise NoActiveVersion(app_id)
            version_id = app.active_version
        version = self.database.get_version(version_id)
        if not version:
            raise VersionnNotFound(version_id)
        graph = self.initialize_graph(version.configuration)
        if not isinstance(input, graph.input_type()):
            raise ApplicationInputTypeMismatch(graph.input_type(), type(input))

        _id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        self.database.create_interaction(
            Interaction(
                id=_id,
                user=user,
                app_id=app_id,
                version_id=version_id,
                created_at=created_at,
                updated_at=created_at,
                output=None,
                data=None,
                error=None,
            )
        )

        @trace(id=_id, name=app.name, user_id=user, session_id=session_id)
        def async_task(input: Union[str, dict, list]) -> str:
            h = AsyncExceptionHandler()
            register_exception_handlers(h)
            try:
                output = graph.run(
                    input,
                    context={
                        "app_id": app_id,
                        "version_id": version_id,
                        "interaction_id": _id,
                        "user": user,
                        "session_id": session_id,
                    },
                    node_callback=lambda *args: self.database.update_interaction(
                        _id,
                        {
                            "data": graph.data,
                        },
                    ),
                )
                self.database.update_interaction(_id, {"output": output})
                return output
            except Exception as e:
                r = h.render(e)
                self.database.update_interaction(
                    _id,
                    {
                        "error": {
                            "status_code": r.status_code,
                            "content": json.loads(r.body),
                        },
                    },
                )

        task = async_task
        if app.langfuse_public_key and app.langfuse_secret_key:
            task = langfuse(
                public_key=app.langfuse_public_key,
                secret_key=app.langfuse_secret_key,
            )(async_task)
        threading.Thread(target=task, kwargs={"input": input}).start()

        return _id

    def poll(self, interaction_id: str) -> Interaction:
        """
        Retrieve invoke result by the interaction id the invoke method returned.

        Args:
            interaction_id (str): The ID of the interaction to retrieve.

        Returns:
            Interaction: The retrieved interaction object.
        """
        return self.database.get_interaction(interaction_id)


class HashableDict(dict):
    """
    HashableDict is a dict, but makes it hashable.
    """

    def __hash__(self):
        return hash(tuple(sorted(self.items())))


class HashableList(list):
    """
    HashableList is a list, but makes it hashable.
    """

    def __hash__(self):
        return hash(tuple(sorted(self)))


@functools.lru_cache
@span(
    name="invoke",
    input_fn=lambda _, kwargs: {"app_id": kwargs["app_id"], "input": kwargs["input"]},
)
def invoke(
    *,
    user: str,
    app_id: str,
    input: Union[str, HashableDict, HashableList],
    session_id: Optional[str] = None,
    timeout: Optional[int] = 300,
    interval: Optional[int] = 10,
) -> str:
    env = Env()
    env.read_env()

    db = Database(create_engine(env.str("DATABASE_URL")))
    invoker = AsyncInvoker(db)

    interaction_id = invoker.invoke(
        user=user, app_id=app_id, input=input, session_id=session_id
    )
    while timeout > 0:
        interaction = invoker.poll(interaction_id)
        if not interaction:
            raise InteractionNotFound(interaction_id)
        if interaction.error:
            raise InteractionError(interaction.error)
        if interaction.output:
            return interaction.output
        time.sleep(interval)
        timeout -= interval
    raise TimeoutError(f"timeout on polling interaction {interaction_id}")


@block(name="Text_Invoke", kind="invoke")
class Invoke(BaseBlock):
    """
    Invoke invokes application with str input.
    """

    def __init__(self, app_id: str, timeout: int = 300):
        self.app_id = app_id
        self.timeout = timeout

    def __call__(self, input: str) -> str:
        return invoke(
            user=self.context["user"] + "@" + self.context["interaction_id"][:8],
            app_id=self.app_id,
            input=input,
            timeout=self.timeout,
            session_id=self.context.get("session_id"),
        )


@block(name="List_Invoke", kind="invoke")
class InvokeWithList(BaseBlock):
    """
    InvokeWithList invokes application with list input.
    """

    def __init__(self, app_id: str, timeout: int = 300):
        self.app_id = app_id
        self.timeout = timeout

    def __call__(self, input: list) -> str:
        return invoke(
            user=self.context["user"] + "@" + self.context["interaction_id"][:8],
            app_id=self.app_id,
            input=HashableList(input),
            timeout=self.timeout,
            session_id=self.context.get("session_id"),
        )


@block(name="Dict_Invoke", kind="invoke")
class InvokeWithDict(BaseBlock):
    """
    Invoke invokes application with dict input.
    """

    def __init__(self, app_id: str, timeout: int = 300):
        self.app_id = app_id
        self.timeout = timeout

    def __call__(self, input: dict) -> str:
        return invoke(
            user=self.context["user"] + "@" + self.context["interaction_id"][:8],
            app_id=self.app_id,
            input=HashableDict(input),
            timeout=self.timeout,
            session_id=self.context.get("session_id"),
        )
