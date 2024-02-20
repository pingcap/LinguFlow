import inspect

import langchain

from resolver import pattern

from .comparator import ListComparator, NumberComparator, TextComparator
from .llm import ChatOpenAIWrapper, OpneAIWrapper
from .secret import Secret
from .template import ChatMessagePrompt, FewShotPromptTemplate, ZeroShotPromptTemplate

# register builtin types
pattern(name="text", builtin=True)(str)
pattern(name="list", builtin=True)(list)
pattern(name="dict", builtin=True)(dict)
pattern(name="float", builtin=True)(float)
pattern(name="integer", builtin=True)(int)
pattern(name="boolean", builtin=True)(bool)
pattern(name="any", builtin=True)(inspect._empty)

# register third-party types
pattern(name="LLM_Model")(langchain.base_language.BaseLanguageModel)
pattern(name="Chat_LLM_Model")(langchain.chat_models.base.BaseChatModel)
pattern(name="Prompt_Template")(langchain.prompts.prompt.StringPromptTemplate)
pattern(name="Chat_Prompt_Template")(langchain.prompts.chat.BaseChatPromptTemplate)
