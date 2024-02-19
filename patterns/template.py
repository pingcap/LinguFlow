from langchain.prompts import MessagesPlaceholder, PromptTemplate, StringPromptTemplate
from langchain.prompts.chat import ChatPromptTemplate, SystemMessagePromptTemplate

from resolver import pattern

from .embedding import Namespace


@pattern(name="Few_Shot_Prompt_Template")
class FewShotPromptTemplate(StringPromptTemplate):
    """
    Template for generating prompts for few-shot learning.
    """

    namespace: Namespace = None
    prefix: str = ""
    suffix: str = ""
    example_prompt: str = ""

    def __init__(
        self,
        namespace: Namespace,
        prefix: str,
        suffix: str,
        example_prompt: str,
    ):
        """
        Initialize the FewShotPromptTemplate with the provided namespace, prefix, suffix, and example prompt.

        Args:
            namespace (Namespace): The namespace for retrieving examples.
            prefix (str): The prefix for the prompt.
            suffix (str): The suffix for the prompt.
            example_prompt (str): The example prompt format.
        """
        super(FewShotPromptTemplate, self).__init__(
            input_variables=list(
                set(
                    PromptTemplate.from_template(prefix).input_variables
                    + PromptTemplate.from_template(suffix).input_variables
                )
            ),
        )
        self.namespace = namespace
        self.prefix = prefix
        self.suffix = suffix
        self.example_prompt = example_prompt

    def format(self, text: str, **kwargs) -> str:
        """
        Format the text with examples retrieved from the namespace.

        Args:
            text (str): The text to format.
            **kwargs: Additional keyword arguments.

        Returns:
            str: The formatted text.
        """
        kwargs["text"] = text
        examples = self.namespace.retrieve(text)
        examples.reverse()
        return self.prefix.format(**kwargs) + "\n" "\n".join(
            [self.example_prompt.format(**e) for e in examples]
        ) + "\n" + self.suffix.format(**kwargs)


@pattern(name="Chat_Message_Prompt")
class ChatMessagePrompt(ChatPromptTemplate):
    """
    Template for generating chat message prompts.
    """

    def __init__(self, system_prompt: str):
        """
        Initialize the ChatMessagePrompt with the provided system prompt.

        Args:
            system_prompt (str): The system prompt.
        """
        system_prompt = SystemMessagePromptTemplate.from_template(system_prompt)
        super(ChatMessagePrompt, self).__init__(
            input_variables=system_prompt.input_variables + ["messages"],
            messages=[
                system_prompt,
                MessagesPlaceholder(variable_name="messages"),
            ],
        )


@pattern(name="Zero_Shot_Prompt_Template")
class ZeroShotPromptTemplate(StringPromptTemplate):
    """
    Template for generating zero-shot prompts.
    """

    prompt_template: str

    def __init__(self, prompt_template: str):
        """
        Initialize the ZeroShotPromptTemplate with the provided prompt template.

        Args:
            prompt_template (str): The prompt template.
        """
        super(ZeroShotPromptTemplate, self).__init__(
            input_variables=PromptTemplate.from_template(
                prompt_template
            ).input_variables,
            prompt_template=prompt_template,
        )
        self.prompt_template = prompt_template

    def format(self, text: str = "", **kwargs) -> str:
        """
        Format the text with the prompt template.

        Args:
            text (str): The text to format.
            **kwargs: Additional keyword arguments.

        Returns:
            str: The formatted text.
        """
        kwargs["text"] = text
        prompt = self.prompt_template.format(**kwargs)
        return prompt
