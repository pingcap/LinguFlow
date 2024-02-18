from abc import ABC, abstractmethod
from typing import List, TypeVar

from resolver import pattern

T = TypeVar("T")


@pattern(name="VectorDB")
class VectorDB(ABC):
    """
    Abstract base class for vector databases.
    """

    @abstractmethod
    def vec_id(self, index: List[str]) -> T:
    """
    Generate an identity from a list of str.

    Args:
        index (List[str]): The list of str which represents an unique data.
    
    Returns:
        T: implemented by sub classes.
    """
        pass

    @abstractmethod
    def retrieve(self, ns: str, vec: List[float], limit: int) -> List[dict]:
        """
        Retrieve data based on the given vector, from given namespace.

        Args:
            ns (str): The namespace to retrieve data from.
            vec: (List[float]): The vector to retrieve data for.
            limit (int): The maximum number of results to return.

        Returns:
            List[dict]: The retrieved data.
        """
        pass

    @abstractmethod
    def upsert(self, ns: str, vec_id: T, vec: List[float], metadata: dict):
        """
        Upsert metadata.

        Args:
            ns (str): The namespace upsert to.
            vec_id (T): The identity of the data.
            vec (List[str]): The vector representation of the data.
            metadata (dict): The metadata to upsert.
        """
        pass

    @abstractmethod
    def delete(self, ns: str, vec_id: T):
        """
        Delete data based on the vector id.

        Args:
            ns (str): The namespace delete from.
            vec_id (T): The vector id to delete.
        """
        pass
