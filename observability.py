import contextvars
import functools
import inspect
from typing import Any, Callable, Optional

from langfuse import Langfuse


class ContextManager:
    context = dict(
        [
            (var.name, var)
            for var in [
                contextvars.ContextVar("langfuse"),
                contextvars.ContextVar("this_observation"),
                contextvars.ContextVar("last_observation"),
            ]
        ]
    )

    def __getattr__(self, name: str) -> Any:
        return self.context[name].get(None)

    def __setattr__(self, name: str, value: Any):
        self.context[name].set(value)

    def push(self, name: str, value: Any) -> contextvars.Token:
        return self.context[name].set(value)

    def pop(self, token: contextvars.Token):
        self.context[token.var.name].reset(token)


def default_input_fn(args, kwargs):
    return {**kwargs, "*args": args} if args else kwargs


def ismethod(func: Callable) -> bool:
    return "self" in inspect.signature(func).parameters


def langfuse(**decorator_kwargs):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ctx = ContextManager()
            token = ctx.push("langfuse", Langfuse(**decorator_kwargs))
            try:
                return func(*args, **kwargs)
            except Exception as e:
                ctx.langfuse.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.langfuse.flush()
                ctx.pop(token)

        # FIXME: it's just a copy of wrapper and await func(...)
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            ctx = ContextManager()
            token = ctx.push("langfuse", Langfuse(**decorator_kwargs))
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                ctx.langfuse.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.langfuse.flush()
                ctx.pop(token)

        return async_wrapper if inspect.iscoroutinefunction(func) else wrapper

    return decorator


def trace(
    input_fn: Callable = default_input_fn,
    output_fn: Callable = lambda x: x,
    **decorator_kwargs,
):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return func(*args, **kwargs)

            input_args = args[1:] if ismethod(func) else args
            token = ctx.push(
                "this_observation",
                ctx.langfuse.trace(
                    **decorator_kwargs, input=input_fn(input_args, kwargs)
                ),
            )
            try:
                output = func(*args, **kwargs)
                ctx.this_observation.update(output=output_fn(output))
                return output
            except Exception as e:
                ctx.this_observation.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.last_observation = ctx.this_observation
                ctx.pop(token)

        # FIXME: it's just a copy of wrapper and await func(...)
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return await func(*args, **kwargs)

            input_args = args[1:] if ismethod(func) else args
            token = ctx.push(
                "this_observation",
                ctx.langfuse.trace(
                    **decorator_kwargs, input=input_fn(input_args, kwargs)
                ),
            )
            try:
                output = await func(*args, **kwargs)
                ctx.this_observation.update(output=output_fn(output))
                return output
            except Exception as e:
                ctx.this_observation.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.last_observation = ctx.this_observation
                ctx.pop(token)

        return async_wrapper if inspect.iscoroutinefunction(func) else wrapper

    return decorator


def span(
    input_fn: Callable = default_input_fn,
    output_fn: Callable = lambda x: x,
    **decorator_kwargs,
):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return func(*args, **kwargs)

            input_args = args[1:] if ismethod(func) else args
            token = ctx.push(
                "this_observation",
                ctx.this_observation.span(
                    **decorator_kwargs, input=input_fn(input_args, kwargs)
                ),
            )
            try:
                output = func(*args, **kwargs)
                ctx.this_observation.end(output=output_fn(output))
                return output
            except Exception as e:
                ctx.this_observation.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.last_observation = ctx.this_observation
                ctx.pop(token)

        # FIXME: it's just a copy of wrapper and await func(...)
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return await func(*args, **kwargs)

            input_args = args[1:] if ismethod(func) else args
            token = ctx.push(
                "this_observation",
                ctx.this_observation.span(
                    **decorator_kwargs, input=input_fn(input_args, kwargs)
                ),
            )
            try:
                output = await func(*args, **kwargs)
                ctx.this_observation.end(output=output_fn(output))
                return output
            except Exception as e:
                ctx.this_observation.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.last_observation = ctx.this_observation
                ctx.pop(token)

        return async_wrapper if inspect.iscoroutinefunction(func) else wrapper

    return decorator


def generation(
    input_fn: Callable = default_input_fn,
    output_fn: Callable = lambda x: x,
    usage_fn: Callable = None,
    **decorator_kwargs,
):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return func(*args, **kwargs)

            input_args = args[1:] if ismethod(func) else args
            token = ctx.push(
                "this_observation",
                ctx.this_observation.generation(
                    **decorator_kwargs, input=input_fn(input_args, kwargs)
                ),
            )
            try:
                output = func(*args, **kwargs)
                if usage_fn:
                    ctx.this_observation.end(
                        output=output_fn(output), usage=usage_fn(output)
                    )
                else:
                    ctx.this_observation.end(output=output_fn(output))
                return output
            except Exception as e:
                ctx.this_observation.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.last_observation = ctx.this_observation
                ctx.pop(token)

        # FIXME: it's just a copy of wrapper and await func(...)
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return await func(*args, **kwargs)

            input_args = args[1:] if ismethod(func) else args
            token = ctx.push(
                "this_observation",
                ctx.this_observation.generation(
                    **decorator_kwargs, input=input_fn(input_args, kwargs)
                ),
            )
            try:
                output = await func(*args, **kwargs)
                if usage_fn:
                    ctx.this_observation.end(
                        output=output_fn(output), usage=usage_fn(output)
                    )
                else:
                    ctx.this_observation.end(output=output_fn(output))
                return output
            except Exception as e:
                ctx.this_observation.event(
                    name=type(e).__name__,
                    level="ERROR",
                    status_message=str(e),
                )
                raise e
            finally:
                ctx.last_observation = ctx.this_observation
                ctx.pop(token)

        return async_wrapper if inspect.iscoroutinefunction(func) else wrapper

    return decorator


def event(
    input_fn: Callable = default_input_fn,
    output_fn: Callable = lambda x: x,
    **decorator_kwargs,
):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return func(*args, **kwargs)

            output = func(*args, **kwargs)
            input_args = args[1:] if ismethod(func) else args
            ctx.last_observation = ctx.this_observation.event(
                **decorator_kwargs,
                input=input_fn(input_args, kwargs),
                output=output_fn(output),
            )
            return output

        # FIXME: it's just a copy of wrapper and await func(...)
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            ctx = ContextManager()
            if not ctx.langfuse:
                return await func(*args, **kwargs)

            output = await func(*args, **kwargs)
            input_args = args[1:] if ismethod(func) else args
            ctx.last_observation = ctx.this_observation.event(
                **decorator_kwargs,
                input=input_fn(input_args, kwargs),
                output=output_fn(output),
            )
            return output

        return async_wrapper if inspect.iscoroutinefunction(func) else wrapper

    return decorator


def current_observation():
    return ContextManager().this_observation


def previous_observation():
    return ContextManager().last_observation
