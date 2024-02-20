from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI

from resolver import pattern

from .secret import Secret


@pattern(name="OpenAI_Complete_LLM")
class OpneAIWrapper(OpenAI):
    """
    A wrapper class for interacting with the OpenAI API for complete language models.
    """

    def __init__(
        self,
        openai_api_key: Secret,
        temperature: float = 0,
        max_tokens: int = 2048,
        model_name: str = "gpt-3.5-turbo-instruct",
    ):
        """
        Initializes an instance of the OpenAI API wrapper.

        Args:
            openai_api_key (Secret): The API key for accessing the OpenAI API.
            temperature (float): The temperature parameter for generating responses (default is 0).
            max_tokens (int): The maximum number of tokens to generate in a single request (default is 2048).
            model_name (str): The name of the model to use (default is "gpt-3.5-turbo-instruct").
        """
        if max_tokens == 0:
            super(OpneAIWrapper, self).__init__(
                model_name=model_name,
                openai_api_key=openai_api_key,
                temperature=temperature,
            )

        else:
            super(OpneAIWrapper, self).__init__(
                model_name=model_name,
                openai_api_key=openai_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
            )


@pattern(name="OpenAI_Chat_LLM")
class ChatOpenAIWrapper(ChatOpenAI):
    """
    A wrapper class for interacting with the ChatOpenAI API.
    """

    def __init__(
        self,
        openai_api_key: Secret,
        temperature: float = 0,
        max_tokens: int = 2048,
        model_name: str = "gpt-3.5-turbo",
    ):
        """
        Initializes an instance of the ChatOpenAI API wrapper.

        Args:
            openai_api_key (Secret): The API key for accessing the OpenAI API.
            temperature (float): The temperature parameter for generating responses (default is 0).
            max_tokens (int): The maximum number of tokens to generate in a single request (default is 2048).
            model_name (str): The name of the model to use (default is "gpt-3.5-turbo").
        """
        if max_tokens == 0:
            super(ChatOpenAIWrapper, self).__init__(
                model_name=model_name,
                openai_api_key=openai_api_key,
                temperature=temperature,
            )
        else:
            super(ChatOpenAIWrapper, self).__init__(
                model_name=model_name,
                openai_api_key=openai_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
            )
