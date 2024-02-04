import inspect
import json
import threading
import uuid
from datetime import datetime
from typing import Dict, List

from environs import Env
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter
from sqlalchemy import create_engine

import patterns
from api.api_schemas import (
    ApplicationBlocksResponse,
    ApplicationCreate,
    ApplicationCreateResponse,
    ApplicationInfo,
    ApplicationInfoResponse,
    ApplicationListResponse,
    ApplicationPatternsResponse,
    ApplicationRun,
    ApplicationRunResponse,
    ApplicationVersionCreate,
    ApplicationVersionInfo,
    BlockInfo,
    InteractionInfoResponse,
    ItemDeleteResponse,
    ItemUpdateResponse,
    Metadata,
    Parameter,
    PatternInfo,
    VersionCreateResponse,
    VersionListResponse,
)
from blocks import BaseBlock
from database import Database
from exceptions import (
    AsyncExceptionHandler,
    NodeConstructError,
    register_exception_handlers,
)
from model import Application, ApplicationVersion, Interaction
from resolver import Resolver
from scheduler import Edge, Graph

router = InferringRouter()


@cbv(router)
class ApplicationView:
    """
    The router class for LinguFlow. Any new api should be added here.
    """
    def __init__(self):
        env = Env()
        env.read_env()
        engine = create_engine(env.str("DSN"))
        self.resolver = Resolver()
        self.database = Database(engine)

    def resolve_params(self, params: Dict[str, inspect.Parameter]) -> List[Parameter]:
        ss = []
        for sname, param in params.items():
            x = {
                "name": sname,
                "class": self.resolver.relookup(param.annotation),
            }
            p = Parameter(
                name=sname,
                class_name=self.resolver.relookup(param.annotation),
            )
            if param.default != inspect.Parameter.empty:
                p.default = param.default
            if param.kind == param.VAR_KEYWORD:
                p.is_variable_keyword = True
            ss.append(p)
        return ss

    def construct_graph_node(self, config: dict) -> BaseBlock:
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
            slots = config.get("slots", {})
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

    @router.get("/patterns")
    def patterns(self) -> ApplicationPatternsResponse:
        names = self.resolver.names()
        patterns = []
        for name in names:
            if (
                self.resolver.lookup(name, "category") == "type"
                or self.resolver.lookup(name, "category") == "builtin"
            ):
                pi = PatternInfo(
                    name=name,
                    alias=self.resolver.lookup(name, "alias"),
                    candidates=self.resolver.candidates(name),
                    slots=None,
                )
                if (not self.resolver.is_abstract(self.resolver.lookup(name))) and (
                    self.resolver.lookup(name, "category") == "type"
                ):
                    pi.slots = self.resolve_params(self.resolver.slots(name))
                patterns.append(pi)
        return ApplicationPatternsResponse(patterns=patterns)

    @router.get("/blocks")
    def blocks(self) -> ApplicationBlocksResponse:
        names = self.resolver.names()
        blocks = []
        for name in names:
            if self.resolver.lookup(name, "category") == "block":
                blocks.append(
                    BlockInfo(
                        name=name,
                        alias=self.resolver.lookup(name, "alias"),
                        dir=self.resolver.lookup(name, "dir"),
                        slots=self.resolve_params(self.resolver.slots(name)),
                        inports=self.resolve_params(self.resolver.inports(name)),
                        outport=self.resolver.relookup(self.resolver.outport(name)),
                    )
                )

        return ApplicationBlocksResponse(blocks=blocks)

    @router.get("/applications/{application_id}")
    def get_app(self, application_id: str) -> ApplicationInfoResponse:
        app = self.database.get_application(application_id)

        return ApplicationInfoResponse(
            application=ApplicationInfo(
                id=app.id,
                name=app.name,
                active_version=app.active_version,
                created_at=int(app.created_at.timestamp()),
                updated_at=int(app.updated_at.timestamp()),
            )
            if app
            else None
        )

    @router.get("/applications")
    def list_app(self) -> ApplicationListResponse:
        apps = self.database.list_applications()
        return ApplicationListResponse(
            applications=[
                ApplicationInfo(
                    id=app.id,
                    name=app.name,
                    active_version=app.active_version,
                    created_at=int(app.created_at.timestamp()),
                    updated_at=int(app.updated_at.timestamp()),
                )
                for app in apps
            ]
        )

    @router.post("/applications")
    def create_app(self, application: ApplicationCreate) -> ApplicationCreateResponse:
        created_at = datetime.utcnow()
        _id = str(uuid.uuid4())
        self.database.create_application(
            Application(
                id=_id,
                name=application.name,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        return ApplicationCreateResponse(id=_id)

    @router.post("/applications/{application_id}/async_run")
    def async_run_app(
        self, application_id: str, config: ApplicationRun
    ) -> ApplicationRunResponse:
        app = self.database.get_application(application_id)
        if not app:
            raise ApplicationNotFound(application_id)
        if not app.active_version:
            NoActiveVersion(application_id)
        version = self.database.get_version(app.active_version)
        if not version:
            raise VersionnNotFound(app.active_version)
        graph = self.initialize_graph(version.configuration)

        _id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        self.database.create_interaction(
            Interaction(
                id=_id,
                version_id=app.active_version,
                created_at=created_at,
                updated_at=created_at,
                output=None,
                data=None,
                error=None,
            )
        )

        def async_run():
            h = AsyncExceptionHandler()
            register_exception_handlers(h)
            try:
                output = graph.run(
                    config.input,
                    node_callback=lambda *args: self.database.update_interaction(
                        _id,
                        {
                            "data": graph.data,
                        },
                    ),
                )
                self.database.update_interaction(_id, {"output": output})
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

        threading.Thread(target=async_run).start()

        return ApplicationRunResponse(id=_id)

    @router.get("/interactions/{interaction_id}")
    def get_interaction(self, interaction_id: str) -> InteractionInfoResponse:
        interaction = self.database.get_interaction(interaction_id)
        if interaction:
            return InteractionInfoResponse(
                id=interaction.id,
                version_id=interaction.version_id,
                created_at=int(interaction.created_at.timestamp()),
                updated_at=int(interaction.updated_at.timestamp()),
                data=interaction.data,
                output=interaction.output,
            )
        else:
            return InteractionInfoResponse(data=None, error="not found")

    @router.put("/applications/{application_id}")
    def update_app_meta(
        self, application_id: str, metadata: Metadata
    ) -> ItemUpdateResponse:
        try:
            updated_at = datetime.utcnow()
            self.database.update_application(
                application_id,
                {
                    "name": metadata.name,
                    "updated_at": updated_at,
                },
            )
            return ItemUpdateResponse(
                success=True,
                message=f"Application {application_id}'s metadata updated.",
            )
        except Exception as e:
            return ItemUpdateResponse(
                success=False,
                message=str(e),
            )

    @router.delete("/applications/{application_id}")
    def delete_app(self, application_id: str) -> ItemDeleteResponse:
        try:
            deleted_at = datetime.utcnow()
            self.database.update_application(
                application_id,
                {
                    "updated_at": deleted_at,
                    "deleted_at": deleted_at,
                },
            )
            return ItemDeleteResponse(
                success=True,
                message=f"Application {application_id} has been deleted.",
            )
        except Exception as e:
            return ItemDeleteResponse(
                success=False,
                message=str(e),
            )

    @router.get("/applications/{application_id}/versions")
    def list_app_versions(self, application_id: str) -> VersionListResponse:
        versions = self.database.list_versions(application_id)
        return VersionListResponse(
            versions=[
                ApplicationVersionInfo(
                    id=version.id,
                    app_id=version.app_id,
                    created_at=int(version.created_at.timestamp()),
                    updated_at=int(version.updated_at.timestamp()),
                    configuration=version.configuration,
                )
                for version in versions
            ]
        )

    @router.post("/applications/{application_id}/versions")
    def create_app_version(
        self,
        application_id: str,
        version: ApplicationVersionCreate,
    ) -> VersionCreateResponse:
        created_at = datetime.utcnow()
        _id = str(uuid.uuid4())
        self.database.create_application(
            ApplicationVersion(
                id=_id,
                app_id=application_id,
                parent_id=version.parent_id,
                created_at=created_at,
                updated_at=created_at,
                configuration=version.configuration.dict(),
            )
        )
        return VersionCreateResponse(id=_id)

    @router.delete("/applications/{application_id}/versions/{version_id}")
    def delete_app_version(
        self, application_id: str, version_id: str
    ) -> ItemDeleteResponse:
        try:
            deleted_at = datetime.utcnow()
            self.database.update_version(
                version_id,
                {
                    "updated_at": deleted_at,
                    "deleted_at": deleted_at,
                },
            )
            return ItemDeleteResponse(
                success=True,
                message=f"Version {version_id} has been deleted.",
            )
        except Exception as e:
            return ItemDeleteResponse(
                success=False,
                message=str(e),
            )

    @router.put("/applications/{application_id}/versions/{version_id}/active")
    def active_app_version(self, application_id: str, version_id: str):
        try:
            updated_at = datetime.utcnow()
            self.database.update_application(
                application_id,
                {
                    "active_version": version_id,
                    "updated_at": updated_at,
                },
            )
            return ItemUpdateResponse(
                success=True,
                message=f"Application {application_id}'s active version updated.",
            )
        except Exception as e:
            return ItemUpdateResponse(
                success=False,
                message=str(e),
            )
