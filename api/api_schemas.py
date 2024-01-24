from typing import Any, Dict, List, Optional, Union

from fastapi_utils.api_model import APIModel
from pydantic import BaseModel


class Parameter(BaseModel):
    name: str
    class_name: str
    default: Optional[Any]
    is_variable_keyword: bool = False


class PatternInfo(BaseModel):
    name: str
    alias: str
    candidates: List[str]
    slots: Optional[List[Parameter]]


class ApplicationPatternsResponse(APIModel):
    patterns: List[PatternInfo]


class Parameter(BaseModel):
    name: str
    class_name: str
    default: Optional[Any]
    is_variable_keyword: bool = False


class BlockInfo(BaseModel):
    name: str
    alias: str
    dir: str
    slots: List[Parameter]
    inports: List[Parameter]
    outports: List[Parameter]


class ApplicationBlocksResponse(APIModel):
    blocks: List[BlockInfo]
