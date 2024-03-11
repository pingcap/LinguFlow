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
import plugins
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
    InteractionInfo,
    InteractionInfoResponse,
    ItemDeleteResponse,
    ItemUpdateResponse,
    Metadata,
    Parameter,
    PatternInfo,
    VersionCreateResponse,
    VersionInfoResponse,
    VersionListResponse,
    VersionMetadata,
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
        """
        Resolves the parameters of a function.

        Args:
            params (Dict[str, inspect.Parameter]): A dictionary
                mapping parameter names to inspect.Parameter objects.

        Returns:
            List[Parameter]: A list of Parameter objects representing the resolved parameters.

        Example:
        ```
        def foo(x: int, y: bool) -> bool:
            ...

        signature = inspect.signature(foo)
        params = dict(signature.parameters)

        parameters = self.resolve_params(params)
        ```
        """
        ss = []
        for sname, param in params.items():
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
        """
        Retrieves application patterns based on resolver information.

        Returns:
            ApplicationPatternsResponse: A response containing a list of PatternInfo objects.
        """
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
        """
        Retrieves application blocks based on resolver information.

        Returns:
            ApplicationBlocksResponse: A response containing a list of BlockInfo objects.
        """
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
        """
        Get information about a specific application.

        Args:
            application_id (str): The ID of the application to retrieve.

        Returns:
            ApplicationInfoResponse: Information about the application, including its ID, name,
                active version, creation timestamp, and last update timestamp.
        """
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
        """
        Retrieve a list of applications.

        Returns:
            ApplicationListResponse: The response containing a list of applications.
        """
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
        """
        Endpoint to create a new application.

        Args:
            application (ApplicationCreate): The application data to create.

        Returns:
            ApplicationCreateResponse: The response containing the ID of the created application.
        """
        created_at = datetime.utcnow()
        _id = str(uuid.uuid4())
        self.database.create_application(
            Application(
                id=_id,
                name=application.name,
                langfuse_public_key=application.langfuse_public_key,
                langfuse_secret_key=application.langfuse_secret_key,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        return ApplicationCreateResponse(id=_id)

    @router.post("/applications/{application_id}/async_run")
    def async_run_app(
        self, application_id: str, config: ApplicationRun
    ) -> ApplicationRunResponse:
        """
        Asynchronously runs an application with the specified ID and configuration.

        Args:
            application_id (str): The ID of the application to run.
            config (ApplicationRun): The configuration for running the application.

        Returns:
            ApplicationRunResponse: The response containing the interaction ID which is
                used for polling running result latter.
        """
        return ApplicationRunResponse(
            id=self.invoker.invoke(config.input, application_id)
        )

    @router.get("/interactions/{interaction_id}")
    def get_interaction(self, interaction_id: str) -> InteractionInfoResponse:
        """
        Retrieves information about a specific interaction by its ID.

        Args:
            interaction_id (str): The ID of the interaction to retrieve.

        Returns:
            InteractionInfoResponse: An object containing information about the interaction.
        """
        interaction = self.invoker.poll(interaction_id)
        return InteractionInfoResponse(
            interaction=(
                InteractionInfo(
                    id=interaction.id,
                    version_id=interaction.version_id,
                    created_at=int(interaction.created_at.timestamp()),
                    updated_at=int(interaction.updated_at.timestamp()),
                    data=interaction.data,
                    error=interaction.error,
                    output=interaction.output,
                )
                if interaction
                else None
            )
        )

    @router.put("/applications/{application_id}")
    def update_app_meta(
        self, application_id: str, metadata: Metadata
    ) -> ItemUpdateResponse:
        """
        Update the metadata of an application.

        Args:
            application_id (str): The ID of the application to update.
            metadata (Metadata): The new metadata for the application.

        Returns:
            ItemUpdateResponse: An object indicating the success or failure of the update operation.
        """
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
        """
        Delete an application by its ID.

        Args:
            application_id (str): The ID of the application to be deleted.

        Returns:
            ItemDeleteResponse: A response indicating the success or failure of the deletion.
        """
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

    @router.post("/applications/{application_id}/versions/{version_id}/async_run")
    def async_run_app_version(
        self, application_id: str, version_id: str, config: ApplicationRun
    ) -> ApplicationRunResponse:
        """
        Asynchronously runs an application with the specified app ID, version ID and configuration.

        Args:
            application_id (str): The ID of the application to run.
            version_id (str): The version of the application to run.
            config (ApplicationRun): The configuration for running the application.

        Returns:
            ApplicationRunResponse: The response containing the interaction ID which is
                used for polling running result latter.
        """
        return ApplicationRunResponse(
            id=self.invoker.invoke(config.input, application_id, version_id)
        )

    @router.get("/applications/{application_id}/versions/{version_id}")
    def get_app_version(
        self, application_id: str, version_id: str
    ) -> VersionInfoResponse:
        version = self.database.get_version(version_id)
        if not version or version.app_id != application_id:
            return VersionInfoResponse(version=None)

        return VersionInfoResponse(
            version=(
                ApplicationVersionInfo(
                    id=version.id,
                    name=version.name,
                    app_id=version.app_id,
                    created_at=int(version.created_at.timestamp()),
                    updated_at=int(version.updated_at.timestamp()),
                    metadata=version.meta,
                    configuration=version.configuration,
                )
            )
        )

    @router.get("/applications/{application_id}/versions")
    def list_app_versions(self, application_id: str) -> VersionListResponse:
        """
        Get a list of application versions for the specified application_id.

        Args:
            application_id (str): The ID of the application.

        Returns:
            VersionListResponse: A response containing a list of ApplicationVersionInfo objects
                representing the versions of the specified application.
        """
        versions = self.database.list_versions(application_id)
        return VersionListResponse(
            versions=[
                ApplicationVersionInfo(
                    id=version.id,
                    name=version.name,
                    app_id=version.app_id,
                    created_at=int(version.created_at.timestamp()),
                    updated_at=int(version.updated_at.timestamp()),
                    metadata=None,
                    configuration=None,
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
        """
        Create a new application version.

        Args:
            application_id (str): The ID of the application.
            version (ApplicationVersionCreate): The details of the new application version.

        Returns:
            VersionCreateResponse: The response containing the ID of the created version.
        """
        created_at = datetime.utcnow()
        _id = str(uuid.uuid4())
        self.database.create_application(
            ApplicationVersion(
                id=_id,
                name=version.name,
                app_id=application_id,
                parent_id=version.parent_id,
                created_at=created_at,
                updated_at=created_at,
                metadata=version.meta,
                configuration=version.configuration.dict(),
            )
        )
        return VersionCreateResponse(id=_id)

    @router.put("/applications/{application_id}/versions/{version_id}")
    def update_app_version_meta(
        self, application_id: str, version_id: str, metadata: VersionMetadata
    ) -> ItemUpdateResponse:
        """
        Update the metadata of an application.

        Args:
            application_id (str): The ID of the application.
            version_id (str): The ID of the version to be updated.
            metadata (VersionMetadata): The new metadata for the version.

        Returns:
            ItemUpdateResponse: An object indicating the success or failure of the update operation.
        """
        try:
            updated_at = datetime.utcnow()
            self.database.update_version(
                version_id,
                {
                    "name": metadata.name,
                    "meta": metadata.metadata,
                    "updated_at": updated_at,
                },
            )
            return ItemUpdateResponse(
                success=True,
                message=f"Version {version_id}'s metadata updated.",
            )
        except Exception as e:
            return ItemUpdateResponse(
                success=False,
                message=str(e),
            )

    @router.delete("/applications/{application_id}/versions/{version_id}")
    def delete_app_version(
        self, application_id: str, version_id: str
    ) -> ItemDeleteResponse:
        """
        Delete a specific version of an application.

        Args:
            application_id (str): The ID of the application.
            version_id (str): The ID of the version to be deleted.

        Returns:
            ItemDeleteResponse: An object indicating whether the deletion was successful.
        """
        try:
            deleted_at = datetime.utcnow()
            app = self.database.get_application(application_id)
            if app.active_version == version_id:
                return ItemDeleteResponse(
                    success=False,
                    message=f"Active version can not be deleted.",
                )

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
        """
        Update the active version of an application in the database.

        Args:
            application_id (str): The ID of the application to update.
            version_id (str): The ID of the version to set as active.

        Returns:
            ItemUpdateResponse: An ItemUpdateResponse indicating the success or failure of the update.
        """
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
