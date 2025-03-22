import inspect
import json
import uuid
from datetime import datetime
from typing import Dict, List

from environs import Env
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter
from langfuse import Langfuse
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
    AppMetadata,
    BlockInfo,
    InteractionInfo,
    InteractionInfoResponse,
    InteractionScore,
    ItemCreateResponse,
    ItemDeleteResponse,
    ItemUpdateResponse,
    Parameter,
    PatternInfo,
    User,
    VersionCreateResponse,
    VersionInfoResponse,
    VersionListResponse,
    VersionMetadata,
)
from blocks import AsyncInvoker
from database import Database
from exceptions import ApplicationNotFound, InteractionNotFound
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
                        description=self.resolver.lookup(name, "description"),
                        examples=self.resolver.lookup(name, "examples"),
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
                    user=app.user,
                    langfuse_public_key=app.langfuse_public_key,
                    langfuse_secret_key=app.langfuse_secret_key,
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
                    user=app.user,
                    langfuse_public_key=app.langfuse_public_key,
                    langfuse_secret_key=app.langfuse_secret_key,
                    active_version=app.active_version,
                    created_at=int(app.created_at.timestamp()),
                    updated_at=int(app.updated_at.timestamp()),
                )
                for app in apps
            ]
        )

    @router.post("/applications")
    def create_app(
        self, request: Request, application: ApplicationCreate
    ) -> ApplicationCreateResponse:
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
                user=request.state.user,
                langfuse_public_key=application.langfuse_public_key,
                langfuse_secret_key=application.langfuse_secret_key,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        return ApplicationCreateResponse(id=_id)

    @router.post("/applications/{application_id}/async_run")
    def async_run_app(
        self, request: Request, application_id: str, config: ApplicationRun
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
            id=self.invoker.invoke(
                user=request.state.user,
                app_id=application_id,
                input=config.input,
                session_id=config.session_id,
            )
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
        if interaction is not None and interaction.error is not None:
            return JSONResponse(**interaction.error)
        return InteractionInfoResponse(
            interaction=(
                InteractionInfo(
                    id=interaction.id,
                    user=interaction.user,
                    version_id=interaction.version_id,
                    created_at=int(interaction.created_at.timestamp()),
                    updated_at=int(interaction.updated_at.timestamp()),
                    data=interaction.data,
                    output=interaction.output,
                )
                if interaction
                else None
            )
        )

    @router.post("/interactions/{interaction_id}/scores")
    def score_interaction(
        self,
        request: Request,
        interaction_id: str,
        score: InteractionScore,
    ) -> ItemCreateResponse:
        """
        Give an interaction a feedback to measure if the result is good.

        Args:
            interaction_id (str): The ID of the interaction to score.
            score (InteractionScore): The score detail

        Returns:
            ItemCreateResponse: An object indicating the success or failure of the score operation.
        """

        # get langfuse configuration
        interaction = self.database.get_interaction(interaction_id)
        if not interaction:
            raise InteractionNotFound(interaction_id)
        app = self.database.get_application(interaction.app_id)
        if not app:
            raise ApplicationNotFound(app_id)
        if not app.langfuse_public_key or not app.langfuse_secret_key:
            return ItemCreateResponse(
                success=False,
                message=f"Langfuse was not configured correctly application {interaction.app_id}.",
            )

        # create score
        langfuse = Langfuse(
            public_key=app.langfuse_public_key,
            secret_key=app.langfuse_secret_key,
        )
        langfuse.score(
            trace_id=interaction_id,
            # use user name as score name since a interaction may be scored by different users
            name=request.state.user,
            value=score.value,
            comment=score.comment,
        )

        # XXX:
        #   The Langfuse SDK executes network requests in the background on a separate thread.
        #   Any exception on that thread cannot be caught here. Therefore, a response with success=True
        #   does not necessarily mean that the Langfuse server has accepted the score.
        return ItemCreateResponse(success=True, message=f"Score has been created.")

    @router.put("/applications/{application_id}")
    def update_app_meta(
        self, application_id: str, metadata: AppMetadata
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
                    "langfuse_public_key": metadata.langfuse_public_key,
                    "langfuse_secret_key": metadata.langfuse_secret_key,
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
        self,
        request: Request,
        application_id: str,
        version_id: str,
        config: ApplicationRun,
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
            id=self.invoker.invoke(
                user=request.state.user,
                app_id=application_id,
                input=config.input,
                version_id=version_id,
                session_id=config.session_id,
            )
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
                    user=version.user,
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
                    user=version.user,
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
        request: Request,
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
        self.database.create_version(
            ApplicationVersion(
                id=_id,
                name=version.name,
                user=request.state.user,
                app_id=application_id,
                parent_id=version.parent_id,
                created_at=created_at,
                updated_at=created_at,
                meta=version.metadata,
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

    @router.get("/ping")
    def ping(self) -> dict:
        return {"message": "pong"}

    @router.get("/me")
    def me(self, request: Request) -> User:
        return User(user=request.state.user)
