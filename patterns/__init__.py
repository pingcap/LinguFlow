import inspect
import langchain
from .secret import Secret
from resolver import pattern

# register builtin types
pattern(name="text", builtin=True)(str)
pattern(name="list", builtin=True)(list)
pattern(name="dict", builtin=True)(dict)
pattern(name="float", builtin=True)(float)
pattern(name="integer", builtin=True)(int)
pattern(name="boolean", builtin=True)(bool)
pattern(name="any", builtin=True)(inspect._empty)

# register third-party types
pattern(name="LLM")(langchain.base_language.BaseLanguageModel)
pattern(name="ChatLLM")(langchain.chat_models.base.BaseChatModel)
pattern(name="PromptTemplate")(langchain.prompts.prompt.StringPromptTemplate)
pattern(name="ChatPromptTemplate")(langchain.prompts.chat.BaseChatPromptTemplate)
pattern(name="Retriever")(langchain.schema.BaseRetriever)