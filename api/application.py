import blocks
import inspect
import patterns
from resolver import Resolver
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter
from typing import Dict
from api.api_schemas import (
    Parameter,
    PatternInfo,
    ApplicationPatternsResponse,
)

router = InferringRouter()

@cbv(router)
class ApplicationView:
    def __init__(self):
        self.resolver = Resolver()

    def resolve_params(self, params: Dict[str, inspect.Parameter]):
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

    @router.get("/applications/patterns")
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