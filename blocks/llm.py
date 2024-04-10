import langchain.chains
from langchain.prompts.chat import BaseChatPromptTemplate
from langchain_core.language_models import BaseChatModel, BaseLanguageModel
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import StringPromptTemplate

from observability import span
from resolver import block

from .base import BaseBlock


@block(name="LLM", kind="llm", description="""test
test new line""", examples="""this is a text""")
class LLMChain(BaseBlock):
    """
    LLMChain render template with given text and pass the result to llm model.
    """

    def __init__(
        self, model: BaseLanguageModel, prompt_template_type: StringPromptTemplate
    ):
        self.chain = langchain.chains.LLMChain(llm=model, prompt=prompt_template_type)

    @span(name="LLM Chain")
    def __call__(self, text: str, **kwargs) -> str:
        return self.chain.predict(text=text, **kwargs)


@block(name="Chat_LLM", kind="llm")
class ChatLLMChain(BaseBlock):
    """
    ChatLLM is a block that uses a chat model to generate a response to a given message.

    Attributes:
        model: BaseChatModel from LangChain.
        prompt_template_type: BaseChatPromptTemplate from LangChain which contains a system_template to use.
    """

    def __init__(
        self, model: BaseChatModel, prompt_template_type: BaseChatPromptTemplate
    ):
        self.chat = model
        self.prompt = prompt_template_type

    @span(name="ChatLLM")
    def __call__(self, messages: list, **kwargs) -> str:
        """
        Generate a response to a given message.

        Args:
            messages: A list of string messages.
            **kwargs: Additional arguments to pass to the prompt template.
        """
        ms = []
        for i, m in enumerate(messages):
            if not isinstance(m, str):
                raise TypeError(f"messages[{i}] must be a string, but got {type(m)}")
            if i % 2 == 0:
                ms.append(HumanMessage(content=m))
            else:
                ms.append(AIMessage(content=m))
        prompt_value = self.prompt.format_prompt(messages=ms, **kwargs)
        response = self.chat.generate_prompt([prompt_value])
        return response.generations[0][0].text
