from typing import List

from langchain_core.language_models import BaseLanguageModel
from langchain_core.messages import BaseMessage
from langchain_core.outputs import Generation, LLMResult
from pydantic import BaseModel

from observability import generation
from resolver import pattern


@pattern(name="Mock_LLM")
class MockLLM(BaseLanguageModel):
    """
    This is an example to show how to add plugin in `plugins` directory.

    MockLLM is useful during developing a new application.
    """

    mock_output: str

    def __init__(self, mock_output: str):
        super(MockLLM, self).__init__(mock_output=mock_output)

    @generation(name="Mock LLM", output_fn=lambda x: x.generations[0][0].text)
    async def agenerate_prompt(self, *args, **kwargs) -> LLMResult:
        return LLMResult(generations=[[Generation(text=self.mock_output)]])

    @generation(name="Mock LLM", output_fn=lambda x: x.generations[0][0].text)
    def generate_prompt(self, *args, **kwargs) -> LLMResult:
        return LLMResult(generations=[[Generation(text=self.mock_output)]])

    @generation(name="Mock LLM")
    async def apredict(self, *args, **kwargs) -> str:
        return self.mock_output

    @generation(name="Mock LLM")
    def predict(self, *args, **kwargs) -> str:
        return self.mock_output

    @generation(name="Mock LLM", output_fn=lambda x: x.content)
    async def apredict_messages(self, *args, **kwargs) -> BaseMessage:
        return BaseMessage(self.mock_output)

    @generation(name="Mock LLM", output_fn=lambda x: x.content)
    def predict_messages(self, *args, **kwargs) -> BaseMessage:
        return BaseMessage(self.mock_output)

    @generation(name="Mock LLM")
    def invoke(self, *args, **kwargs) -> str:
        return self.mock_output
