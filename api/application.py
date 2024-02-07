import inspect
import json
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
from blocks import AsyncInvoker
from database import Database
from model import Application, ApplicationVersion
from resolver import Resolver

router = InferringRouter()


@cbv(router)
class ApplicationView:
    """
    The router class for LinguFlow. Any new api should be added here.
    """

    def __init__(self):
        env = Env()
        env.read_env()
        self.database = Database(create_engine(env.str("DATABASE_URL")))
        self.invoker = AsyncInvoker(self.database)
        self.resolver = Resolver()

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
            application=(
                ApplicationInfo(
                    id=app.id,
                    name=app.name,
                    active_version=app.active_version,
                    created_at=int(app.created_at.timestamp()),
                    updated_at=int(app.updated_at.timestamp()),
                )
                if app
                else None
            )
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
        return ApplicationRunResponse(
            id=self.invoker.invoke(application_id, config.input)
        )

    @router.get("/interactions/{interaction_id}")
    def get_interaction(self, interaction_id: str) -> InteractionInfoResponse:
        interaction = self.invoker.poll(interaction_id)
        if not interaction:
            raise InteractionNotFound(interaction_id)

        return InteractionInfoResponse(
            id=interaction.id,
            version_id=interaction.version_id,
            created_at=int(interaction.created_at.timestamp()),
            updated_at=int(interaction.updated_at.timestamp()),
            data=interaction.data,
            error=interaction.error,
            output=interaction.output,
        )

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
