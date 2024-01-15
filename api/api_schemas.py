from pydantic import BaseModel
from fastapi_utils.api_model import APIModel
from typing import Any, Dict, List, Optional, Union


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