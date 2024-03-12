import inspect

import langchain_core

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
pattern(name="LLM_Model")(langchain_core.language_models.BaseLanguageModel)
pattern(name="Chat_LLM_Model")(langchain_core.language_models.BaseChatModel)
pattern(name="Prompt_Template")(langchain_core.prompts.StringPromptTemplate)
pattern(name="Chat_Prompt_Template")(langchain_core.prompts.BaseChatPromptTemplate)
