import abc
import logging
from typing import List

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class BaseAuthPlugin(abc.ABC):
    def __init__(self):
        """
        The __init__ method should NOT take any args or kwargs except self.
        """
        pass

    def authorize_url(self, request: Request) -> str:
        """
        Build an authorize URL for the request. The app will redirect the user to that URL.
            And the service on that URL should redirect the user back to the login path.

        If authorize_url method returns None, the message method will be used to explain
            why the request can not be processed.
        """
        raise NotImplementedError

    def login(self, request: Request) -> Response:
        """
        This method should handle the login request.
        The login request typically should contains token from a third party SSO platform.
        """
        raise NotImplementedError

    def user_identity(self, request: Request) -> str:
        """
        Get user identity from request.
        """
        return "anonymous"

    def message(self, request: Request) -> str:
        """
        Show message to explain why the request can't be processed.
        """
        raise NotImplementedError


def load_auth_plugin() -> BaseAuthPlugin:
    subcls = BaseAuthPlugin.__subclasses__()
    if len(subcls) > 1:
        logging.warning(
            f"multiple auth plugin found: {[cls.__name__ for cls in subcls]}"
        )
        logging.warning(
            f"only the first auth plugin ({subcls[0].__name__}) will be used"
        )
        return subcls[0]()
    elif len(subcls) == 0:
        logging.info("the default anonymous auth plugin will be used")
        return BaseAuthPlugin()
    return subcls[0]()


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        login_path: str,
        white_list: List[str] = [],
    ):
        super().__init__(app)
        self.login_path = login_path
        self.white_list = white_list
        self.auth_plugin = load_auth_plugin()

    async def dispatch(self, request: Request, call_next):
        if request.url.path == self.login_path:
            return self.auth_plugin.login(request)

        if request.url.path in self.white_list:
            return await call_next(request)

        user = self.auth_plugin.user_identity(request)
        if user:
            request.state.user = user
            return await call_next(request)

        auth_url = self.auth_plugin.authorize_url(request)
        if auth_url:
            return JSONResponse({"auth_url": auth_url}, status_code=401)
        else:
            return JSONResponse(
                {
                    "status": "error",
                    "message": self.auth_plugin.message(request),
                },
                status_code=403,
            )
