import langchain.chains
from langchain.base_language import BaseLanguageModel
from langchain.prompts.prompt import StringPromptTemplate

from resolver import block

from .base import BaseBlock


@block(name="LLM", kind="llm")
class LLMChain(BaseBlock):
    """
    LLMChain render template with given text and pass the result to llm model.
    """

    def __init__(self, model: BaseLanguageModel, prompt_template: StringPromptTemplate):
        self.chain = langchain.chains.LLMChain(llm=model, prompt=prompt_template)

    def __call__(self, text: str, **kwargs) -> str:
        return self.chain.run(text=text, **kwargs)
