from typing import List

import requests

from resolver import pattern

from ..secret import Secret
from .embedding import EmbeddingModel


@pattern(name="OpenAI_Embedding")
class OpenAIEmbedding(EmbeddingModel):
    """
    Embedding model using OpenAI API.
    """

    def __init__(self, api_key: Secret):
        """
        Initialize an OpenAIEmbedding instance.

        Args:
            api_key (Secret): The API key for accessing OpenAI services.
        """
        self.api_key = api_key

    def embedding(self, text: str) -> List[float]:
        """
        Get the embedding for the given text.

        Args:
            text (str): The input text.

        Returns:
            List[float]: The embedding vector for the input text.
        """
        response = requests.post(
            "https://api.openai.com/v1/embeddings",
            json={
                "input": text,
                "model": "text-embedding-ada-002",
            },
            headers={
                "Authorization": f"Bearer {self.api_key}",
            },
        )
        return response.json()["data"][0]["embedding"]
