import functools
import urllib

import requests

from resolver import block

from .base import BaseBlock


@functools.lru_cache
def search_google(cx: str, key: str, query: str) -> dict:
    query = urllib.parse.quote(query)
    url = f"https://www.googleapis.com/customsearch/v1?cx={cx}&key={key}&q={query}"
    return requests.get(url).json()


@block(name="Google_Search", kind="tools")
class GoogleSearch(BaseBlock):
    """
    This block searches Google to find related snippets.

    Args:
        cx (str): The custom search engine ID.
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

    def __init__(self, cx: str, key: str, top_k=5):
        self.cx = cx
        self.key = key
        self.top_k = 5

    def __call__(self, text: str) -> list:
        return [item["snippet"] for item in r["items"][: self.top_k]]
