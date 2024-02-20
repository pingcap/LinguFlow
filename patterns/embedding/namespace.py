from typing import List

from resolver import pattern

from .embedding import EmbeddingModel
from .vectordb import VectorDB


@pattern(name="Vector_Namespace")
class Namespace:
    """
    Represents a namespace for storing and retrieving embeddings.
    """

    def __init__(
        self,
        db: VectorDB,
        name: str,
        embedding_key: str,
        index_key: str,
        embedding_model: EmbeddingModel,
    ):
        """
        Initialize a Namespace instance.

        Args:
            db (VectorDB): The VectorDB instance.
            name (str): The name of the namespace.
            embedding_key (str): The key in the metadata for the embedding.
            index_key (str): The key(s) in the metadata for the index.
            embedding_model (EmbeddingModel): The embedding model instance.
        """
        self._db = db
        self._name = name
        self._embedding_key = embedding_key
        self._index_keys = [k for k in index_key.split(",") if k]
        self._embedding_model = embedding_model

    def text(self, metadata: dict) -> str:
        """
        Get the text to be embeded from the metadata dict.

        Args:
            metadata (dict): The metadata dictionary.

        Returns:
            str: The text to be embeded from the metadata.
        """
        return metadata[self._embedding_key]

    def index(self, metadata: dict) -> List[str]:
        """
        Get the identity of metadata.

        Args:
            metadata (dict): The metadata dictionary.

        Returns:
            List[str]: The list of str which identify the metadata.
        """
        return [str(metadata[k]) for k in self._index_keys]

    def retrieve(self, text: str, limit: int = 5) -> List[dict]:
        """
        Retrieve data based on the given text.

        Args:
            text (str): The text to retrieve data for.
            limit (int): The maximum number of results to return. Defaults to 5.

        Returns:
            List[dict]: The retrieved data.
        """
        vec = self._embedding_model.embedding(text)
        return self._db.retrieve(self._name, vec, limit)

    def upsert(self, metadata: dict):
        """
        Upsert metadata.

        Args:
            metadata (dict): The metadata to upsert.
        """
        idx = self.index(metadata)
        vec_id = self._db.vec_id(idx)
        text = self.text(metadata)
        vec = self._embedding_model.embedding(text)
        self._db.upsert(self._name, vec_id, vec, metadata)

    def delete(self, vec_id: str):
        """
        Delete data based on the vector id.

        Args:
            vec_id (str): The vector id to delete.
        """
        self._db.delete(self._name, vec_id)
