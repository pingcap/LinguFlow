import functools
import inspect
from typing import Dict, List, Union

from exceptions import UnregisteredError


class Resolver:
    """
    The name resolver, used to register/resolve blocks and patterns.

    Example:

    ```
    @block(name='test_block')
    class TestBlock(BaseBlock):
        ...

    r = Resolver()

    assert type(r.lookup('test_block')) == type(TestBlock)
    ```
    """

    _block_list = []
    _pattern_list = []

    def __init__(self):
        # check _block_list and _pattern_list
        self.consistent_assert()

    def consistent_assert(self):
        """
        Checks if block and pattern definitions are valid.
        Raises errors any definition is not valid.
        """
        nameset = set()
        typeset = set()

        for i, n in enumerate(self._block_list + self._pattern_list):
            name = n["name"]
            if name in nameset:
                raise DuplicatedNameError(name)
            if n["class"] in typeset:
                raise DuplicatedTypeError(n["class"])
            nameset.add(name)
            typeset.add(n["class"])

            if n["category"] == "builtin":
                continue

            types = set()

            if not self.is_abstract(self.lookup(name)):
                # add slots for check
                slots = self.slots(name)
                for s in slots.values():
                    types.add(s.annotation)

            if i < len(self._block_list):
                # add inports for check
                inports = self.inports(name)
                for s in inports.values():
                    types.add(s.annotation)

                # add outport
                types.add(self.outport(name))

            for t in types:
                if self.relookup(t) is None:
                    raise UnregisteredError(name, t)

    def names(self) -> List[str]:
        """
        Returns a list of names of registered blocks and patterns.
        """
        return [b["name"] for b in self._block_list] + [
            p["name"] for p in self._pattern_list
        ]

    @functools.lru_cache
    def lookup(self, name: str, key: str = "class") -> Union[str, type]:
        """
        Looks up a block or pattern by its name.
        Args:
            name: The name of the block or pattern.
            key: The key to extract from lookup result.
        Returns:
            The class (or other property the `key` specified) corresponding to the name,
                or None if the name is not found.
        """
        for n in self._block_list + self._pattern_list:
            if n["name"] == name:
                return n.get(key)
        return None

    @functools.lru_cache
    def relookup(self, cls: type) -> str:
        """
        Looks up a name by it's class (opposite with lookup).
        Args:
            cls: The class type to look up.
        Returns:
            The name of the class, or None if not found.
        """
        for n in self._block_list + self._pattern_list:
            if n["class"] == cls:
                return n["name"]
        return None

    @functools.lru_cache
    def is_abstract(self, cls: type) -> bool:
        """
        Checks if a class has abstract methods.
        Args:
            cls: The class to check.
        Returns:
            True if the class has abstract methods, False otherwise.
        """
        for _, m in inspect.getmembers(cls):
            if getattr(m, "__isabstractmethod__", False):
                return True
        return False

    @functools.lru_cache
    def candidates(self, name: str) -> List[str]:
        """
        Returns a list of candidate names for a given block or pattern name.
        Args:
            name: The name of the block or pattern.
        Returns:
            A list of candidate names.
        """
        cls = self.lookup(name)
        if cls is None:
            return []
        names = []
        for p in self._pattern_list:
            if not issubclass(p["class"], cls) or self.is_abstract(p["class"]):
                continue
            name = self.relookup(p["class"])
            if name is not None:
                names.append(name)
        return names

    @functools.lru_cache
    def slots(self, name: str) -> Dict[str, inspect.Parameter]:
        """
        Returns a dictionary of parameters for a given block or pattern name.
        Args:
            name: The name of the block or pattern.
        Returns:
            A dictionary mapping parameters to their __init__ annotations.
        """
        cls = self.lookup(name)
        if cls is None:
            return None

        signature = inspect.signature(cls.__init__)
        parameters = dict(signature.parameters)
        parameters.pop("self")
        return parameters

    @functools.lru_cache
    def inports(self, name: str) -> Dict[str, inspect.Parameter]:
        """
        Returns a dictionary of parameters for a given block name.
        Args:
            name: The name of the block.
        Returns:
            A dictionary mapping parameters to their __call__ annotations.
        """
        cls = self.lookup(name)
        if cls is None:
            return None

        signature = inspect.signature(cls.__call__)
        parameters = dict(signature.parameters)
        parameters.pop("self")
        return parameters

    @functools.lru_cache
    def outport(self, name: str) -> type:
        """
        Returns the outport type for a given block name.
        Args:
            name: The name of the block.
        Returns:
            The annotation of the __call__ output type.
        """
        cls = self.lookup(name)
        if cls is None:
            return None

        signature = inspect.signature(cls.__call__)
        return signature.return_annotation


def block(name: str, kind: str, alias: str = None):
    """
    Decorator for registering a block class.
    Args:
        name: The name of the block.
        kind: The kind of the block (e.g., 'input', 'output').
        alias: An optional alias for the block name.
    Returns:
        The decorated class.
    """

    def decorator(cls):
        Resolver._block_list.append(
            {
                "name": name,
                "alias": alias or name,
                "category": "block",
                "dir": kind,
                "class": cls,
            }
        )
        return cls

    return decorator


def pattern(name: str, builtin: bool = False, alias: str = None):
    """
    Decorator for registering a pattern class.
    Args:
        name: The name of the pattern.
        builtin: Whether the pattern is built-in or not.
        alias: An optional alias for the pattern name.
    Returns:
        The decorated class.
    """

    def decorator(cls):
        Resolver._pattern_list.append(
            {
                "name": name,
                "alias": alias or name,
                "category": "builtin" if builtin else "type",
                "class": cls,
            }
        )
        return cls

    return decorator
