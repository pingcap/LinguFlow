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
    patterns: List[PatternInfo]


class BlockInfo(BaseModel):
    name: str
    alias: str
    dir: str
    slots: List[Parameter]
    inports: List[Parameter]
    outports: List[Parameter]


class ApplicationBlocksResponse(APIModel):
    blocks: List[BlockInfo]


class ApplicationInfo(BaseModel):
    id: str
    name: str
    active_version: Optional[str]
    created_at: int
    updated_at: int


class Metadata(APIModel):
    name: str


class InteractionInfoResponse(APIModel):
    id: str
    version_id: str
    created_at: int
    updated_at: int
    output: Optional[str] = None
    data: Optional[Dict[str, str]] = None


class ApplicationListResponse(APIModel):
    applications: List[ApplicationInfo]


class ApplicationInfoResponse(APIModel):
    application: Optional[ApplicationInfo]


class ApplicationCreateResponse(APIModel):
    id: ApplicationID


class ApplicationCreate(APIModel):
    name: str


class ItemDeleteResponse(APIModel):
    success: bool
    message: str


class ItemUpdateResponse(APIModel):
    success: bool
    message: str


class ApplicationVersionInfo(BaseModel):
    id: str
    app_id: str
    created_at: int
    updated_at: int


class GraphNode(BaseModel):
    id: str
    name: str
    alias: Optional[str] = None
    slots: Optional[dict] = None


class GraphEdge(BaseModel):
    src_block: Optional[str] = None
    dst_block: Optional[str] = None
    dst_port: Optional[str] = None
    alias: Optional[str] = None
    case: Union[Optional[bool], Optional[str], Optional[int]] = None


class GraphConfiguration(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class VersionListResponse(APIModel):
    versions: List[ApplicationVersionInfo]


class VersionCreateResponse(APIModel):
    id: VersionID


class ApplicationVersionCreate(APIModel):
    parent_id: Optional[str]
    configuration: GraphConfiguration


class ApplicationRun(APIModel):
    input: Union[str, List[str], Dict[str, str]]


class ApplicationRunResponse(APIModel):
    id: InteractionID
