from typing import List

import pinecone

from resolver import pattern

from ..secret import Secret
from .vectordb import VectorDB


@pattern(name="Pinecone")
class Pinecone(VectorDB):
    """
    VectorDB implementation using Pinecone.
    """

    def __init__(self, environment: str, index: str, api_key: Secret):
        """
        Initialize a Pinecone instance.

        Args:
            environment (str): The Pinecone environment.
            index (str): The name of the index.
            api_key (Secret): The API key for accessing Pinecone services.
        """
        pinecone.init(environment=environment, api_key=api_key)
        self.index = pinecone.Index(index)

    def delete_ns(self, ns: str):
        """
        Delete a namespace.

        Args:
            ns (str): The namespace to delete.
        """
        self.index.delete(delete_all=True, namespace=ns)

    def vec_id(self, index: List[str]) -> str:
        """
        Get the vector id by its' unique index values.

        Args:
            index (List[str]): The index values.

        Returns:
            str: The vector id computed from the index.
        """
        h = hashlib.new("md5")
        for x in index:
            h.update(hashlib.sha256(x.encode()).digest())
        return h.hexdigest()

    def retrieve(self, ns: str, vec: List[float], limit: int) -> List[dict]:
        """
        Retrieve data from Pinecone.

        Args:
            ns (str): The namespace to retrieve data from.
            vec (List[float]): The vector to retrieve data for.
            limit (int): The maximum number of results to return.

        Returns:
            List[dict]: The retrieved data.
        """
        return [
            {**x["metadata"], "_id": x["id"], "_score": x["score"]}
            for x in self.index.query(
                namespace=ns,
                top_k=limit,
                include_metadata=True,
                vector=vec,
            )["matches"]
        ]

    def upsert(self, ns: str, vec_id: str, vec: List[float], metadata: dict):
        """
        Upsert data into Pinecone.

        Args:
            ns (str): The namespace to upsert data to.
            vec_id (str): The id of the data.
            vec (List[float]): The vector representation of the data.
            metadata (dict): The data to be upsert.
        """
        self.index.upsert(
            vectors=[
                {
                    "id": vec_id,
                    "values": vec,
                    "metadata": metadata,
                }
            ],
            namespace=ns,
        )

    def delete(self, ns: str, vec_id: str):
        """
        Delete data from Pinecone.

        Args:
            ns (str): The namespace to delete data from.
            vec_id (str): The vector id to be deleted.
        """
        self.index.delete(ids=[vec_id], namespace=ns)
