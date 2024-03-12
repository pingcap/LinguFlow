import langchain.chains
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import StringPromptTemplate

from observability import span
from resolver import block

from .base import BaseBlock


@block(name="LLM", kind="llm")
class LLMChain(BaseBlock):
    """
    LLMChain render template with given text and pass the result to llm model.
    """

    def __init__(self, model: BaseLanguageModel, prompt_template: StringPromptTemplate):
        self.chain = langchain.chains.LLMChain(llm=model, prompt=prompt_template)

    @span(name="LLM Chain")
    def __call__(self, text: str, **kwargs) -> str:
        return self.chain.predict(text=text, **kwargs)
