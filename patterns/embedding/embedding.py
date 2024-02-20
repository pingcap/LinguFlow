from abc import ABC, abstractmethod
from typing import List

from resolver import pattern


@pattern(name="Embedding_Model")
class EmbeddingModel(ABC):
    """
    Abstract base class for embedding models.
    """

    @abstractmethod
    def embedding(self, text) -> List[float]:
        """
        Convert the given text into an embedding vector.

        Args:
            text (str): The input text to convert.

        Returns:
            List[float]: The embedding vector for the input text.
        """
        pass
