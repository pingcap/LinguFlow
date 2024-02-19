from typing import List

import requests
from openai import OpenAI

from exceptions import EmbeddingError
from resolver import pattern

from ..secret import Secret
from .embedding import EmbeddingModel


@pattern(name="OpenAI_Embedding")
class OpenAIEmbedding(EmbeddingModel):
    """
    Embedding model using OpenAI API.
    """

    def __init__(self, api_key: Secret, model_name: str = "text-embedding-ada-002"):
        """
        Initialize an OpenAIEmbedding instance.

        Args:
            api_key (Secret): The API key for accessing OpenAI services.
        """
        self.client = OpenAI(api_key=api_key)
        self.model_name = model_name

    def embedding(self, text: str) -> List[float]:
        """
        Get the embedding for the given text.

        Args:
            text (str): The input text.

        Returns:
            List[float]: The embedding vector for the input text.
        """

        try:
            return (
                self.client.embeddings.create(
                    input=[text],
                    model=self.model_name,
                )
                .data[0]
                .embedding
            )
        except Exception as e:
            raise EmbeddingError(self.model_name, text, str(e))
