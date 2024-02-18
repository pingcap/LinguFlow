from typing import List

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointIdsList, PointStruct, VectorParams

from resolver import pattern

from ..secret import Secret
from .vectordb import VectorDB


@pattern(name="Qdrant")
class Qdrant(VectorDB):
    """
    VectorDB implementation using Qdrant.
    """

    def __init__(self, url: str, api_key: Secret = None):
        """
        Initialize a Qdrant instance.

        Args:
            url (str): The URL of the Qdrant server.
            api_key (Secret, optional): The API key for accessing Qdrant services. Defaults to None.
        """
        self.client = QdrantClient(url=url, api_key=api_key)

    def create_ns(self, ns: str, size: int):
        """
        Create a new namespace in Qdrant.

        Args:
            ns (str): The name of the namespace to create.
            size (int): The size of the vectors in the namespace.
        """
        self.client.recreate_collection(
            collection_name=ns,
            vectors_config=VectorParams(size=size, distance=Distance.COSINE),
        )

    def delete_ns(self, ns: str):
        """
        Delete a namespace from Qdrant.

        Args:
            ns (str): The name of the namespace to delete.
        """
        self.client.delete_collection(collection_name=ns)

    def vec_id(self, index: List[str]) -> str:
        """
        Generate a unique vector id based on the index.

        Args:
            index (List[str]): The index used to generate the id.

        Returns:
            str: The generated vector id.
        """
        h = hashlib.new("md5")
        for x in index:
            h.update(hashlib.sha256(x.encode()).digest())
        return h.hexdigest()

    def retrieve(self, ns: str, vec: List[float], limit: int) -> List[dict]:
        """
        Retrieve data from Qdrant.

        Args:
            ns (str): The namespace to retrieve data from.
            vec (List[float]): The query vector.
            limit (int): The maximum number of results to return.

        Returns:
            List[dict]: The retrieved data.
        """
        xs = self.client.search(
            collection_name=ns,
            query_vector=vec,
            limit=limit,
        )
        return [
            {
                **x.payload,
                "_id": x.id,
                "_score": x.score,
            }
            for x in xs
        ]

    def upsert(self, ns: str, vec_id: str, vec: List[float], metadata: dict):
        """
        Upsert data into Qdrant.

        Args:
            ns (str): The namespace to upsert data into.
            vec_id (str): The id of the data.
            vec (List[float]): The vector representation of the data.
            metadata (dict): The data to insert.
        """
        self.client.upsert(
            collection_name=ns,
            points=[
                PointStruct(
                    id=vec_id,
                    vector=vec,
                    payload=metadata,
                )
            ],
        )

    def delete(self, ns: str, vec_id: str):
        """
        Delete data from Qdrant.

        Args:
            ns (str): The namespace to delete data from.
            vec_id (str): The vector id to delete.
        """
        self.client.delete(
            collection_name=ns,
            points_selector=PointIdsList(points=[vec_id]),
        )
