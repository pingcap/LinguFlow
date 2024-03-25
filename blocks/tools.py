import functools
import urllib

import requests

from observability import span
from patterns import Secret
from resolver import block

from .base import BaseBlock


@functools.lru_cache
def search_google(search_engine_id: str, key: str, query: str) -> dict:
    query = urllib.parse.quote(query)
    url = f"https://www.googleapis.com/customsearch/v1?cx={search_engine_id}&key={key}&q={query}"
    return requests.get(url).json()


@block(name="Google_Search", kind="tools")
class GoogleSearch(BaseBlock):
    """
    This block searches Google to find related snippets.

    Args:
        search_engine_id (str): The custom search engine ID.
        key (str): Your API key.
        top_k (int, optional): The number of top results to return. Defaults to 5.

    Example:

    ```
    node = GoogleSearch("<custom search engine id>", "<your api key>")
    result = node("what is tidb?")
    ```

    Returns:
        list: A list of snippets related to the search query.
    """

    def __init__(self, search_engine_id: str, key: Secret, top_k=5):
        self.search_engine_id = search_engine_id
        self.key = key
        self.top_k = top_k

    @span(name="search google")
    def __call__(self, text: str) -> list:
        r = search_google(self.search_engine_id, self.key, text)
        items = r.get("items", [])
        return [item["snippet"] for item in items[: self.top_k]]
