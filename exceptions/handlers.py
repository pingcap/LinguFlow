import functools
import traceback
from typing import Callable, Type

from fastapi import status
from fastapi.responses import JSONResponse
from openai import (
    AuthenticationError,
    BadRequestError,
    ConflictError,
    InternalServerError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
    UnprocessableEntityError,
)
from sqlalchemy.exc import DatabaseError, SQLAlchemyError

from .exceptions import *


def graph_node_exception_handler(request, exc):
    if isinstance(
        exc.__cause__,
        (
            BadRequestError,
            AuthenticationError,
            PermissionDeniedError,
            NotFoundError,
            ConflictError,
            UnprocessableEntityError,
            RateLimitError,
            InternalServerError,
        ),
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "node_id": exc.node_id,
                "code": "openai_invalid_request_error",
                "message": str(exc.__cause__),
            },
        )
    elif isinstance(exc.__cause__, InvokeError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "node_id": exc.node_id,
                "code": "invoke_error",
                "message": str(exc.__cause__),
                "error": {
                    "application_id": exc.__cause__.application_id,
                    "code": exc.__cause__.code,
                    "message": exc.__cause__.message,
                    "node_id": exc.__cause__.node_id,
                },
            },
        )
    elif isinstance(exc.__cause__, TimeoutError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "node_id": exc.node_id,
                "code": "timeout",
                "message": str(exc.__cause__),
            },
        )
    elif issubclass(type(exc.__cause__), DatabaseError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "node_id": exc.node_id,
                "code": "db_query_error",
                "message": str(exc.__cause__),
            },
        )
    else:
        print(traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "node_id": exc.node_id,
                "code": "unknown",
                "message": f"except {type(exc.__cause__)}",
            },
        )


def graph_check_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "bad_graph",
            "message": str(exc),
        },
    )


def database_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "database_error",
            "message": str(exc),
        },
    )


def node_construct_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "node_construct_error",
            "message": str(exc),
        },
    )


def application_not_found_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "code": "app_not_found",
            "message": str(exc),
        },
    )


def interaction_not_found_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "code": "interaction_not_found",
            "message": str(exc),
        },
    )


def not_implemented_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "not_implemented",
            "message": str(exc),
        },
    )


def timeout_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "timeout",
            "message": str(exc),
        },
    )


def exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "unknown",
            "message": str(exc),
        },
    )


class AsyncExceptionHandler:
    """
    AsyncExceptionHandler is used to handle exceptions in async thread.

    Handlers is registered with AsyncExceptionHandler, so when an exception
    is catched, the render method can render the exception as a serializable
    object and we can persistent it and return it to user in the interaction
    api in the future.
    """

    def __init__(self):
        self.exception_handlers = {}

    def add_exception_handler(self, exc_class: Type[Exception], handler: Callable):
        self.exception_handlers[exc_class] = handler

    def exception_handler(self, exc_class: Type[Exception]):
        return functools.partial(self.add_exception_handler, exc_class)

    def render(self, exc) -> JSONResponse:
        exc_class = type(exc)

        if exc_class in self.exception_handlers:
            return self.exception_handlers[exc_class](None, exc)
        return self.exception_handlers[Exception](None, exc)


def register_exception_handlers(app):
    app.exception_handler(NodeException)(graph_node_exception_handler)
    app.exception_handler(GraphCheckError)(graph_check_exception_handler)
    app.exception_handler(SQLAlchemyError)(database_exception_handler)
    app.exception_handler(NodeConstructError)(node_construct_exception_handler)
    app.exception_handler(ApplicationNotFound)(application_not_found_handler)
    app.exception_handler(InteractionNotFound)(interaction_not_found_handler)
    app.exception_handler(NotImplementedError)(not_implemented_exception_handler)
    app.exception_handler(PluginNotFoundError)(plugin_not_found_exception_handler)
    app.exception_handler(Exception)(exception_handler)
