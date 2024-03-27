from typing import Any, Dict, List, NewType, Optional, Union
from uuid import UUID

from fastapi_utils.api_model import APIModel
from pydantic import BaseModel

ApplicationID = NewType("ApplicationID", UUID)
VersionID = NewType("VersionID", UUID)
InteractionID = NewType("InteractionID", UUID)


class Parameter(BaseModel):
    """
    Parameter describles the parameter of Block.__init__ and Pattern.__init__ .

    For example, for Secret pattern it has a __init__ function:

    ```
    def __init__(self, plaintext: str):
        ...
    ```

    So the Parameter `plaintext` will be:

    ```json
    {
        "name": "plaintext"
        "class_name": "text",
        "default": null,
        "is_variable_keyword": false
    }
    ```
    """

    name: str
    class_name: str
    default: Optional[Any]
    is_variable_keyword: bool = False


class PatternInfo(BaseModel):
    """
    PatternInfo describe how to construct a Pattern itself.

    For example, for Secret pattern it has a __init__ function:

    ```
    def __init__(self, plaintext: str):
        ...
    ```

    So its' PatternInfo will be:

    ```json
    {
        "name": "Secret",
        "alias": null,
        "candidates": ["Secret"],
        "slots": [{
            "name": "plaintext"
            "class_name": "text",
            "default": null,
            "is_variable_keyword": false
        }]
    }
    ```
    """

    name: str
    alias: str
    candidates: List[str]
    slots: Optional[List[Parameter]]


class ApplicationPatternsResponse(APIModel):
    """
    The response model for /patterns.
    """

    patterns: List[PatternInfo]


class BlockInfo(BaseModel):
    """
    A `Block` is a node in LinguFlow DAG.

    BlockInfo class describes:
    - what the node take (inports property)
    - what the node produce (outport property)
    - how to construct the node (slots property)
    """

    name: str
    alias: str
    dir: str
    slots: List[Parameter]
    inports: List[Parameter]
    outport: str  # the output class name


class ApplicationBlocksResponse(APIModel):
    """
    The response model for /blocks.
    """

    blocks: List[BlockInfo]


class ApplicationInfo(BaseModel):
    """
    ApplicationInfo models the app object.
    """

    id: str
    name: str
    user: str
    langfuse_public_key: Optional[str]
    langfuse_secret_key: Optional[str]
    active_version: Optional[str]
    created_at: int
    updated_at: int


class ApplicationVersionInfo(BaseModel):
    """
    ApplicationVersionInfo models the app version object.
    An app can have multiple versions (but at most one active).
    """

    id: str
    name: str
    user: str
    app_id: str
    created_at: int
    updated_at: int
    metadata: Optional[dict]
    configuration: Optional[dict]


class GraphNode(BaseModel):
    """
    GraphNode describes nodes in DAG.
    It defines the id and fills construction parameters for blocks.
    """

    id: str
    name: str
    alias: Optional[str] = None
    slots: Optional[dict] = None


class GraphEdge(BaseModel):
    """
    GraphEdge defines the dataflow direction between nodes in the DAG.
    """

    src_block: Optional[str] = None
    dst_block: Optional[str] = None
    dst_port: Optional[str] = None
    alias: Optional[str] = None
    case: Union[Optional[bool], Optional[str], Optional[int]] = None


class GraphConfiguration(BaseModel):
    """
    GraphConfiguration defines the DAG in app version.
    It contains a node list which defines how to construct each node.
    And a edige list which defines how data flows.
    """

    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AppMetadata(APIModel):
    """
    The request model for updating app data.
    """

    name: str
    langfuse_public_key: Optional[str]
    langfuse_secret_key: Optional[str]


class VersionMetadata(APIModel):
    """
    The request model for updating app version data.
    """

    name: str
    metadata: Optional[dict]


class InteractionInfo(BaseModel):
    """
    InteractionInfo models the interaction object.
    """

    id: str
    user: str
    version_id: str
    created_at: int
    updated_at: int
    output: Optional[str]
    data: Optional[Dict[str, Any]]


class InteractionInfoResponse(APIModel):
    """
    The response model for /interactions/{interaction_id}.
    """

    interaction: Optional[InteractionInfo]


class ApplicationListResponse(APIModel):
    """
    The response model for /applications, which returns a list of app info.
    """

    applications: List[ApplicationInfo]


class ApplicationInfoResponse(APIModel):
    """
    The response model for /applications/{application_id}, which returns information
    of specific app. If the specifed app not found, the application property will be
    None.
    """

    application: Optional[ApplicationInfo]


class ApplicationCreateResponse(APIModel):
    """
    The response model for creating app.
    """

    id: ApplicationID


class ApplicationCreate(APIModel):
    """
    The request model for creating app.
    """

    name: str
    langfuse_public_key: Optional[str]
    langfuse_secret_key: Optional[str]


class ItemDeleteResponse(APIModel):
    """
    The response model for app/version deletion.
    """

    success: bool
    message: str


class ItemUpdateResponse(APIModel):
    """
    The response model for app/version update.
    """

    success: bool
    message: str


class VersionInfoResponse(APIModel):
    """
    The response model for /applications/{application_id}/versions/{version_id},
    which returns information of specific app version. If the specifed version not
    found, the version property will be None.
    """

    version: Optional[ApplicationVersionInfo]


class VersionListResponse(APIModel):
    """
    The response model for application version list api.
    """

    versions: List[ApplicationVersionInfo]


class VersionCreateResponse(APIModel):
    """The reaponse model for app version creation api."""

    id: VersionID


class ApplicationVersionCreate(APIModel):
    """The request model for app version creation api."""

    name: str
    parent_id: Optional[str]
    metadata: Optional[dict]
    configuration: GraphConfiguration


class ApplicationRun(APIModel):
    """The request model for trigger an app."""

    input: Union[str, List[str], Dict[str, str]]
    session_id: Optional[str]


class ApplicationRunResponse(APIModel):
    """The response model for trigger an app."""

    id: InteractionID


class User(APIModel):
    """The user identity"""

    user: str
