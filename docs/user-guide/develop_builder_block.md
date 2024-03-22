# Block

## General

A Block represents a node within the Directed Acyclic Graph (DAG), each embodying a specific processing logic. Typically, a Block comprises several components:
- **Block Name**: The name of the block.
- **Block ID**: The unique identifier of the block.
- **Copy Block ID**: A feature to copy the block's ID.
- **Conditional Port**: Accepts True or False outputs from upstream `condition` type blocks, determining whether to execute this block based on the upstream result.
- **Inport**: The information inputted into this block. Some blocks support multiple inports. Inports can handle `text`, `list`, `dict` data types.
- **Add an Inport**: Adds an additional inport to the block. Manually added inports support connections of `any` data type.
- **Outport**: The information outputted from this block. Outports typically support `text`, `list`, `dict`, `boolean` data types.
- **Configuration**: Specific configuration details for the block, which vary from one block type to another.

## Block Category

LinguFlow offers essential Block types necessary for building LinguFlow applications, including:
- **Input & Output**: For receiving inputs and sending outputs.
- **Data Process**: For manipulating and processing data.
- **Condition**: For making decisions based on certain conditions.
- **LLM**: For integrating Large Language Model functionalities.
- **Invoke**: For calling other blocks or applications within LinguFlow.
- **Tools**: For utilizing third-party tools or services.

### Input & Output

#### Text_Input

- **Description**: Defines the input type for a LinguFlow App. It allows sending information of `text` type to the LinguFlow application during an API call.
- **Outport**: `text`
- **Example**: 

```markdown
- Outport: "Who are you?"
```

#### List_Input

- **Description**: Defines the input type for a LinguFlow App. It supports sending information of `list` type to the LinguFlow application during an API call.
- **Outport**: `list`
- **Example**: 

```markdown
- Outport: ["hi", "Hello, can I help you?", "Who are you?"]
```

#### Dict_Input

- **Description**: Defines the input type for a LinguFlow App. It facilitates sending information of `dict` type to the LinguFlow application during an API call.
- **Outport**: `dict`
- **Example**: 

```markdown
- Outport: {"key_1": "value_1", "key_2": "value_2"}
```

#### Text_Output

- **Description**: Specifies the output type for a LinguFlow App. After the LinguFlow application has finished running, it outputs a result of `text` type.
- **Inport**: `text`
- **Example**: 

```markdown
- Inport: "I'm LinguFlow."
```

### Data Processing

#### Dict_KeySelect_to_Text

- **Description**: Selects a specific `key`'s `value` from a `dict`.
- **Inport**: `dict`
- **Outport**: `text`
- **Configuration**:
    - **Key**: Specifies a particular `key`.
- **Example**: 

```markdown
- Inport: {"key_1": "value_1", "key_2": "value_2"}
- Configuration: key="key_1"
- Outport: "value_1"
```

#### List_Join_to_Text

- **Description**: Merges a `list` into a single `text` string. The `list` typically contains multiple `text` elements.
- **Inport**: Supports multiple inports, each corresponding to a `list`.
- **Outport**: Merged `text`
- **Configuration**:
    - **Template**: Describes how to render each list element.
    - **Delimiter**: Describes how to concatenate the rendered elements.
- **Example**: 

```markdown
- Inport: ["text 1", "text 2", "text 3"]
- Configuration:
    - template="--{input}--"
    - delimiter='\n'
- Outport: "--text 1--\n--text 2--\n--text 3--\n"
```

#### List_Concat_to_List

- **Description**: Concatenates two `lists` in sequence into a single `list`.
- **Inport**: 
    - **seq1**: `list`
    - **seq2**: `list`
- **Outport**: Concatenated `list`.
- **Example**: 

```markdown
- Inport: ["a", "b"], ["1", "2"]
- Outport: ["a", "b", "1", "2"]
```

#### Text_Join_to_Dict

- **Description**: Combines multiple `texts` into a `dict`.
- **Inport**: Supports multiple inports, each corresponding to a `text`.
- **Outport**: Combined `dict`.
- **Example**: 

```markdown
- Inport: 
    - Inport name: "a", value: "b"
    - Inport name: "1", value: "2"
- Outport: {"a": "b", "1": "2"}
```

#### Text_Split_to_List

- **Description**: Parses `text` into a `list` based on specified rules.
- **Inport**: `text`
- **Outport**: `list`
- **Configuration**:
    - **Delim**: The delimiter character in the text.
    - **Prefix**: Trims a prefix from each element.
    - **Suffix**: Trims a suffix from each element.
- **Example**: 

```markdown
- Inport: "|abc-\n|def-\n|ghi-\n"
- Configuration:
    - delim='\n'
    - prefix='|'
    - suffix='-'
- Outport: ["abc", "def", "ghi"]
```

### Condition

#### Text_Condition

- **Description**: Evaluates a `text` input and outputs a boolean result based on the evaluation.
- **Inport**: `text`
- **Outport**: `boolean`
- **Configuration**:
    - **Comparator**: Supports text evaluation logic, including "Text Equals", "Text Contains", "Text Has Prefix", "Text Has Suffix". Outputs "True" if the condition is met, "False" otherwise.
- **Example**: 

```markdown
- Inport: "success"
- Configuration:
    - comparator: Text_Equal_With
        - value: "success"
- Outport: "True"
```

#### List_Condition

- **Description**: Evaluates a `list` input and outputs a boolean result based on the evaluation.
- **Inport**: `list`
- **Outport**: `boolean`
- **Configuration**:
    - **Comparator**: Supports list evaluation logic, including "List Contains", "List Is Empty". Outputs "True" if the condition is met, "False" otherwise.
- **Example**: 

```markdown
- Inport: ["abc", "def", "ghi"]
- Configuration:
    - comparator: List_Is_Empty
- Outport: "false"
```

### LLM

#### LLM

- **Description**: Interacts with an LLM.
- **Inport**: Default inport is `text`. Additional inports can be created for input, which can be referenced in the template by inserting the inport name.
- **Outport**: `text`
- **Configuration**:
    - **Model**: Currently supports OpenAI's series of language models.
    - **Prompt Template Type**: Currently supports Zero_Shot_Prompt_Template and Few_Shot_Prompt_Template.
- **Example**: 

```markdown
- Inport: "who are you?"
- Configuration:
    - model: OpenAI_Chat_LLM
        - openai_api_key: {key}
        - temperature: 0
        - max_tokens: 4096
        - model_name: "gpt-3.5-turbo"
    - prompt_template_type: Zero_Shot_Prompt_Template
        - prompt_template: "you are a useful assistant.\n question: {text}"
- Outport: "I'm LinguFlow."
```

### Invoke

#### Text_Invoke

- **Description**: Invokes another LinguFlow application, transferring `text` type content to it.
- **Inport**: `text`
- **Outport**: `text`
- **Configuration**:
    - **app_id**: Enter the ID of the LinguFlow application you wish to invoke.
    - **timeout**: Invocation timeout in seconds.
- **Example**: 

```markdown
- Inport: "who are you?"
- Configuration:
    - app_id: {id}
    - timeout: 300
- Outport: "I'm LinguFlow."
```

#### List_Invoke

- **Description**: Invokes another LinguFlow application, transferring `list` type content to it.
- **Inport**: `list`
- **Outport**: `text`
- **Configuration**:
    - **app_id**: Enter the ID of the LinguFlow application you wish to invoke.
    - **timeout**: Invocation timeout in seconds.
- **Example**: 

```markdown
- Inport: ["hi", "Hello, can I help you?", "who are you?"]
- Configuration:
    - app_id: {id}
    - timeout: 300
- Outport: "I'm LinguFlow."
```

#### Dict_Invoke

- **Description**: Invokes another LinguFlow application, transferring `dict` type content to it.
- **Inport**: `dict`
- **Outport**: `text`
- **Configuration**:
    - **app_id**: Enter the ID of the LinguFlow application you wish to invoke.
    - **timeout**: Invocation timeout in seconds.
- **Example**: 

```markdown
- Inport: {"key_1": "value_1", "key_2": "value_2"}
- Configuration:
    - app_id: {id}
    - timeout: 300
- Outport: "value_3"
```

### Tools

#### Google_Search

- **Description**: Queries results using the Google search engine.
- **Inport**: `text`
- **Outport**: `list`
- **Configuration**:
    - **search_engine_id**: Enter your [Programmable Search Engine ID](https://developers.google.com/custom-search/v1/introduction).
    - **key**: Enter your [API Key](https://developers.google.com/custom-search/v1/introduction).
    - **top_k**: Specify the number of results to retrieve.
- **Example**: 

```markdown
- Inport: "who are you?"
- Configuration:
    - search_engine_id: {id}
    - key: {key}
    - top_k: 2
- Outport: ["I'm LinguFlow.", "I'm LinguFlow."]
```