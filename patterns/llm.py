from typing import List

from langchain_core.outputs import LLMResult
from langchain_core.prompt_values import PromptValue
from langchain_openai import ChatOpenAI, OpenAI

from observability import generation
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

    def generate_prompt(self, prompts: List[PromptValue], *args, **kwargs) -> LLMResult:
        input_texts = (
            [p.to_string() for p in prompts]
            if len(prompts) != 1
            else prompts[0].to_string()
        )

        def parse_output(r: LLMResult):
            if len(r.generations) == 1:
                return r.generations[0][0].text
            else:
                return [g[0].text for g in r.generations]

        return generation(
            name="OpenAI_Complete_LLM",
            input_fn=lambda args, kwargs: input_texts,
            output_fn=parse_output,
            usage_fn=lambda r: r.llm_output["token_usage"],
        )(super().generate_prompt)(prompts, *args, **kwargs)


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

    def generate_prompt(self, prompts: List[PromptValue], *args, **kwargs) -> LLMResult:
        input_texts = (
            [p.to_string() for p in prompts]
            if len(prompts) != 1
            else prompts[0].to_string()
        )

        def parse_output(r: LLMResult):
            if len(r.generations) == 1:
                return r.generations[0][0].text
            else:
                return [g[0].text for g in r.generations]

        return generation(
            name="OpenAI_Complete_LLM",
            input_fn=lambda args, kwargs: input_texts,
            output_fn=parse_output,
            usage_fn=lambda r: r.llm_output["token_usage"],
        )(super().generate_prompt)(prompts, *args, **kwargs)
