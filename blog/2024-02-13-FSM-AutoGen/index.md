---
title: "How I Contributed to a 20k+ Stars Open Source Project for the First Time: Assist in the Amazing Graph Feature for GroupChat in MicroSoft/AutoGen"
authors:
  - freedeaths
tags: [Agent, AutoGen]
---

## TL;DR

The document discusses the development and application of a new feature for Microsoft's AutoGen framework, focusing on improving Large Language Models (LLMs) for complex business scenarios using a Multi-Agents framework. The team from PingCAP introduced `GroupChat`, a feature that allows multiple agents (Planner, Engineer, Executor, Critic, User) to collaborate on tasks, enhancing the LLM's ability to handle complex tasks by breaking them down into smaller, manageable parts. The key innovation is the application of a Finite-State Machine (FSM) to control the order of responses from different agents, ensuring tasks are completed accurately and efficiently. The feature was successfully implemented and tested, showing a 100% success rate in controlled experiments. The document also covers the challenges faced during development, including integrating the feature with existing code and ensuring compatibility with other features. The FSM feature is seen as a significant advancement for `GroupChat`, making it more controllable and predictable for users.

## Introduction

### Background

In the past year, Large Language Models (LLMs) have brought tremendous impact to the world, and PingCAP has been actively following up on AI empowered applications. We are a small team called Lab in PingCAP and are dedicated to developing better AI applications for business and developers. Previously, we developed TiDB Bot, which is a complex Retrieval-Augmented Generation (RAG) application, on which we wrote a [blog post](https://medium.com/@developer-relations/some-attempts-to-optimize-the-accuracy-of-tidb-bot-responses-42b109d0a073). 

At the same time, we developed a low-code platform for LLM application development and deployment based on Directed Acyclic Graphs (DAGs) for non-coders (to be open-sourced soon). 

In this series of explorations, We realized that DAG cannot effectively utilize loops, sacrificing the self-correction ability of LLM. And another subjective feelings is that the further potential of DAG + RAG may become more and more difficult to exploit, and we need to find a higher-ceiling and more imaginative pattern to make LLM better serve the business. Therefore, we started to try to use the Multi-Agents framework to solve more complex business problems.

Among a lot of Multi-Agents frameworks, AutoGen caught my attention for the following reasons:

1. The concept is simple enough
2. The examples in the Notebook are very inspiring

This coincides with our previous idea, which is to use a relatively unified and simple paradigm (using multiple agents as a group similar to https://lilianweng.github.io/posts/2023-06-23-agent/) to solve a large class of tasks. The simple concept means strong universality (possibly accompanied by difficulty in handling). The awesome examples can indirectly prove that it has a high ceiling, a large imagination, so we decided to use AutoGen to do some experiments and evaluate how complex real business scenarios it can handle.

![Agent](/img/agent_concept.png)

### Motivation

We have assigned the task of conducting an internal Exploratory Data Analysis (EDA) and Root Cause Analysis (RCA) to LLM. It involves understanding private domain knowledge, TEXT2SQL, data statistics and analysis, et al. It is a comprehensive Tabular Question Answering (TQA) task, and if we want to apply it in production, it requires more than just a successful experimental result. Reliability, cost, and other factors need to be considered. Additionally, LLM itself introduces uncertainty in its output. Therefore, the more complex the task and the longer the context, the higher the probability of error occurring at some point. There might be mistakes in writing SQL queries, the business tables might undergo changes, and the features that need to be analyzed may vary over time. Moreover, there is a possibility that the task description provided by the human initiating the task may not be accurate. All these reasons can lead to errors in intermediate steps. If we continue to use a DAG (Directed Acyclic Graph) to implement this, the probability of success will be very low, or we will need a significant amount of manual effort to increase the success rate.

Therefore, we decided to use the AutoGen framework to address this problem. In PingCAP's practice, we have realized the importance of allowing the LLM to focus each prompt on one specific small task, rather than mixing multiple requirements together. So, for this complex task, we introduced `GroupChat`. The `Planner` focuses on breaking down the steps, while the `Engineer` and `Executor` focus on executing the tasks defined by the `Planner`. The `Critic` is responsible for double-checking the results. There is also a `User` agent to deliver the task. 

The experimental results have been quite exciting. Even with ultra-long contexts of 100K+ tokens, we have consistently achieved a success rate of 75% in producing the expected results. However, using it in a serious production environment is still not sufficient. The extremely long contexts pose significant challenges in terms of stability optimization and cost. Conducting several dozen repeated experiments has cost nearly $400. Therefore, we have to consider a more cost-effective experimental approach by decoupling the required capabilities of this task and using the "controlled variable method" to test each sub-capability isolatedly.

In previous experiments, I noticed that not every GroupChat response was in the expected order, which resulted in adding a lot of irrelevant and confusing context, negatively impacting the final outcome and cost. Therefore, I am considering designing a specific evaluation for the GroupChat's ability to control the order of responses. And that's what motivated the story from there.

## Contributions

### Minimum Verification Test Design

I designed a task as shown in the figure: each agent counts according to the transfer conditions. The current GPT-3.5 has no problem determining whether integers up to 30 are divisible by 3 or 5. Moreover, the context of this task is short enough, so it can be assumed that apart from the order of speech, the entire task should not pose any difficulties for GPT-4.

![FSM](/img/FSM_logic.png)

But the experimental results were astonishing. GPT-4 or GPT-4-turbo surprisingly failed to complete the task as expected, which I never expected. Controlling the order of speech seems to be the only job for `GroupChatManager`. This also means that in many scenarios, it may not be able to effectively complete tasks.

If we consider each agent as a state, and each agent speaks according to certain conditions. For example, `User` always initiates the task first, followed by `Planner` creating a plan. Then `Engineer` and `Executor` work alternately, with `Critic` intervening when necessary, and after `Critic`, only `Planner` should revise additional plans. Each state can only exist at a time, and there are transition conditions between states. Therefore, `GroupChat` can be well abstracted as a Finite-State Machine (FSM).

I noticed that there is a method called `speaker_selection_method` in the `GroupChat` class, so naturally, I thought of adding a method called `fsm` and providing a description of the FSM to allow the manager to select the next speaker based on its constraints.

```python
fsm = {
    "agents": [engineer, planner, executor, critic, user_proxy],
    "transitions": [
        {"from": user_proxy, "to": planner, "on": None},
        {"from": planner, "to": engineer, "on": None},
        {"from": engineer, "to": executor, "on": "If the last number mentioned by `Engineer` is a multiple of 3, the next speaker can only be `Executor`."},
        {"from": executor, "to": engineer, "on": None},
        {"from": engineer, "to": critic, "on": "If the last number mentioned by `Engineer` is not a multiple of 3, the next speaker can only be `Executor`."},
        {"from": critic, "to": engineer, "on": "If the last number mentioned by the Critic is not a multiple of 5, the next speaker can only be `Planner`."},
        {"from": critic, "to": planner, "on": "If the last number mentioned by the Critic is a multiple of 5, the next speaker can only be `Planner`."},
    ]
}

groupchat = autogen.GroupChat(
    agents=[engineer, planner, executor, critic, user_proxy], messages=[], max_round=25, allow_repeat_speaker=False, finite_state_machine=fsm, speaker_selection_method="fsm"
)
```

Following my own design, I quickly implemented an MVP and the experimental results were consistent with expectations. I repeated it 20 times and achieved a 100% success rate.

Just when I was excited and about to submit an issue, I decided to do a search in the history and found [PR #857](https://github.com/microsoft/autogen/pull/857), which attempted to use a graph to describe `GroupChat` and make it speak in a predetermined order. This overlaps with my idea.

Furthermore, I discovered that in the released versions, `ConversableAgent` has a parameter called `description`, which is different from `system_message`. The latter is a system prompt for self-reference, while the former is used to introduce oneself to other agents. I can also describe the transition conditions in the FSM using the `description`. In other words, I can combine the `description` with the graph to achieve a complete description of the FSM. Without disrupting the existing design (using `description`) and maintaining high cohesion (using `on` conditions), I have decided to choose the former approach.

When I found that PR #857 was also unable to count in the expected order, I opened an [issue](https://github.com/microsoft/autogen/issues/1400) on the repository immediately*.

> [*] Note: As I mentioned [here](https://github.com/microsoft/autogen/issues/1400#issuecomment-1914368471), I made a mistake in a hurry before submitting the issue. I mistakenly thought that the code in my environment was the latest code from the branch where PR #857 was located. In fact, the latest code of PR #857 works as expected. Therefore, I sincerely apologize to everyone.

### Push for the Merge of PR 857

After submitting the issue, I received very [positive feedbacks](https://github.com/microsoft/autogen/pull/857#issuecomment-1913909945) from the community. Due to [this opportunity](https://github.com/microsoft/autogen/pull/857#issuecomment-1911666678), I started considering how to provide the FSM feature to everyone.

Although the original author of the PR mentioned that transition conditions were not considered in this PR**, as mentioned earlier, by combining the `description` parameter of `ConversableAgent` with the graph in PR #857, we can achieve the same effect as FSM. To avoid wasting time with new discussions that a new PR might bring, I decided to continue on the existing PR.

For the existing PR, I actually only made two improvement suggestions:

1. If a speaker has only one successor, there is no need for the LLM to determine the next speaker. We can directly output the successor as the next speaker. This not only enhances stability but also saves cost for calling LLM.
2. Because the next state in FSM is determined only by the current state and transition conditions, and is independent of any previous state, we only need to keep track of the last speaker and its content when selecting the next speaker. This also contributes to enhancing stability and reducing costs. The path to enhancing stability here is different from the first point. The first point directly avoids unnecessary LLM calling, while the second point avoids the side effects of long context on the quality of LLM output.**

The first point was easily accepted by everyone, but both the PR author and the repository owner had concerns about the second point. They thought my suggestion was too radical and it was not adopted.**

> [**] Note: I will summarize these in the "Lessons Learned" section.

Because this PR has been open for nearly 2 months, it troubled me more than the above two enhancements. Firstly, this is a significant feature, and there are nearly a thousand comments in the PR with a lot of context. Additionally, I wasn't involved in the initial design discussion, so I need to quickly align myself with the information and understand the existing design details.

Secondly, since this PR has not been merged into the main branch for a long time, many new features have been deployed, and they inevitably conflict with this PR in terms of design. This caused a unit test for another feature that depends on `GroupChat` to fail when attempting to merge PR #857 into the main branch.

I carefully reviewed the conflicting feature, which provides the functionality for an external agent to initiate a task in GroupChat. This is also an important feature that I have considered before, where, for example, a doctor can request a consultation from another team when treating a patient. I believe it is crucial. So I further analyzed the points of conflict between the two PRs: [PR #912](https://github.com/microsoft/autogen/pull/912) introduces nodes that are not in the graph, resulting in its successor being empty, while PR #857 aims to gracefully exit if there is a sink node in the graph. Both of these requirements are reasonable. Therefore, I divided the case of having no successor into two categories, distinguishing whether it is outside of the graph or if it is a sink node, and implemented different handling strategies for them, effectively considering both of these features.

After nearly a week of collaboration and with the help of multiple contributors, we successfully merged this feature into the main branch and officially released it to users in version `0.2.11`.

## Application of the FSM Feature

Actually, I believe that in most of use cases, besides brainstorming, FSM can be considered an essential feature of `GroupChat`. In addition to the existing notebook example, as I previously described in the issue, there is another way to implement FSM. You can think of it as a demonstration of how to organize `GroupChat` based on FSM in the `AutoGen` framework.

### Usage

1. Import dependencies

    ```python
    from autogen.agentchat import GroupChat, AssistantAgent, UserProxyAgent, GroupChatManager
    from autogen.oai.openai_utils import config_list_from_dotenv
    ```
2. Configure LLM parameters

    ```python
    # Please feel free to change it as you wish
    config_list = config_list_from_dotenv(
            dotenv_file_path='.env',
            model_api_key_map={'gpt-4-1106-preview':'OPENAI_API_KEY'},
            filter_dict={
                "model": {
                    "gpt-4-1106-preview"
                }
            }
        )

    gpt_config = {
        "cache_seed": None,
        "temperature": 0,
        "config_list": config_list,
        "timeout": 100,
    }
    ```

3. Define the task

    ```python
    # describe the task
    task = """Add 1 to the number output by the previous role. If the previous number is 20, output "TERMINATE"."""
    ```

4. Define agents

    ```python
    # agents configuration
    engineer = AssistantAgent(
        name="Engineer",
        llm_config=gpt_config,
        system_message=task,
        description="""I am **ONLY** allowed to speak **immediately** after `Planner`, `Critic` and `Executor`.
    If the last number mentioned by `Critic` is not a multiple of 5, the next speaker must be `Engineer`.
    """
    )

    planner = AssistantAgent(
        name="Planner",
        system_message=task,
        llm_config=gpt_config,
        description="""I am **ONLY** allowed to speak **immediately** after `User` or `Critic`.
    If the last number mentioned by `Critic` is a multiple of 5, the next speaker must be `Planner`.
    """
    )

    executor = AssistantAgent(
        name="Executor",
        system_message=task,
        is_termination_msg=lambda x: x.get("content", "") and x.get("content", "").rstrip().endswith("FINISH"),
        llm_config=gpt_config,
        description="""I am **ONLY** allowed to speak **immediately** after `Engineer`.
    If the last number mentioned by `Engineer` is a multiple of 3, the next speaker can only be `Executor`.
    """
    )

    critic = AssistantAgent(
        name="Critic",
        system_message=task,
        llm_config=gpt_config,
        description="""I am **ONLY** allowed to speak **immediately** after `Engineer`.
    If the last number mentioned by `Engineer` is not a multiple of 3, the next speaker can only be `Critic`.
    """
    )

    user_proxy = UserProxyAgent(
        name="User",
        system_message=task,
        code_execution_config=False,
        human_input_mode="NEVER",
        llm_config=False,
        description="""
    Never select me as a speaker. 
    """
    )
    ```

    1. Here, I have configured the `system_messages` as "task" because every agent should know what it needs to do. In this example, each agent has the same task, which is to count in sequence.
    2. **The most important point is the `description` parameter, where I have used natural language to describe the transition conditions of the FSM. Because the manager knows which agents are available next based on the constraints of the graph, I describe in the `description` field of each candidate agent when it can speak, effectively describing the transition conditions in the FSM.**

5. Define the graph

    ```python
    graph_dict = {}
    graph_dict[user_proxy] = [planner]
    graph_dict[planner] = [engineer]
    graph_dict[engineer] = [critic, executor]
    graph_dict[critic] = [engineer, planner]
    graph_dict[executor] = [engineer]
    ```

    1. **The graph here and the transition conditions mentioned above together form a complete FSM. Both are essential and cannot be missing.**
    2. You can visualize it as you wish, which is shown as follow

    ![visualization](/img/FSM_of_multi-agents.png)

6. Define a `GroupChat` and a `GroupChatManager`

    ```python
    agents = [user_proxy, engineer, planner, executor, critic]

    # create the groupchat
    group_chat = GroupChat(agents=agents, messages=[], max_round=25, allowed_or_disallowed_speaker_transitions=graph_dict, allow_repeat_speaker=None, speaker_transitions_type="allowed")

    # create the manager
    manager = GroupChatManager(
        groupchat=group_chat, 
        llm_config=gpt_config,
        is_termination_msg=lambda x: x.get("content", "") and x.get("content", "").rstrip().endswith("TERMINATE"),
        code_execution_config=False,
    )
    ```

7. Initiate the chat

    ```python
    # initiate the task
    user_proxy.initiate_chat(
        manager,
        message="1",
        clear_history=True
    )
    ```

8. You may get the following output(I deleted the ignorable warning):

    ```
    User (to chat_manager):

    1

    --------------------------------------------------------------------------------
    Planner (to chat_manager):

    2

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    3

    --------------------------------------------------------------------------------
    Executor (to chat_manager):

    4

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    5

    --------------------------------------------------------------------------------
    Critic (to chat_manager):

    6

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    7

    --------------------------------------------------------------------------------
    Critic (to chat_manager):

    8

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    9

    --------------------------------------------------------------------------------
    Executor (to chat_manager):

    10

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    11

    --------------------------------------------------------------------------------
    Critic (to chat_manager):

    12

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    13

    --------------------------------------------------------------------------------
    Critic (to chat_manager):

    14

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    15

    --------------------------------------------------------------------------------
    Executor (to chat_manager):

    16

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    17

    --------------------------------------------------------------------------------
    Critic (to chat_manager):

    18

    --------------------------------------------------------------------------------
    Engineer (to chat_manager):

    19

    --------------------------------------------------------------------------------
    Critic (to chat_manager):

    20

    --------------------------------------------------------------------------------
    Planner (to chat_manager):

    TERMINATE
    ```

## Discussion

So far, we have witnessed the power of FSM. I hope it can make everyone's `GroupChat` more controllable and predictable. Here, I would like to express my gratitude to all the developers who have helped me. Thank you for providing me with various information and suggestions. I would also like to thank the repo owners and the PR author for giving me this opportunity to collaborate in development and release this exciting feature.

Furthermore, there are some lessons learned and prospects to share.

### Lessons Learned

1. Effective communication is crucial throughout the entire development process, especially in context of using a non-native language. This becomes even more important. Do not hesitate to clarify any areas of misunderstanding.

2. In the parts I marked with [**] above, upon reflection, I realized that before I raised Issue #1400, it seemed that nobody had considered combining the `description` and graph in the solution. Although the example in the notebook was exciting, it was not a complete FSM. Therefore, in the original design, relying only on the `last_speaker` and its content to determine the next speaker could indeed pose reliability risks. I was confused because my second suggestion was not adopted, perhaps because I had assumed that everyone would combine the `description` and graph to use as a complete FSM. This may have caused a gap in understanding. The above is just my personal reflection from my perspective, so please correct me if I'm wrong.

### Future Works

1. As mentioned in the second item of the Lessons Learned, it could be considered to add an optional parameter that allows the `GroupChat` to configure the manager to only consider the last speaker, thus potentially improving accuracy and cost-effectiveness if the complete FSM provided.

2. Before the release of `AutoGenStudio`, I had implemented a backend service locally that was almost identical. However, once `AutoGenStudio` was available, I quickly embraced it. At that time, `AutoGenStudio` did not yet support `GroupChat`. Although the new version now supports it, there may still be some breaking changes in terms of graph serialization and persistence. It is important to consider how to integrate the two with minimal impact.

Finally, I would like to express my gratitude once again to everyone, including but not limited to the initiator @joshkyh of PR #857, the `AutoGen` repo owner @sonichi, Reviewers like @IANTHEREAL, @afourney, @qingyun-wu, et al., who has helped me throughout this process. This is my first time contributing to such a popular open-source project, and it has been a wonderful experience. I hope to contribute more ideas to the `AutoGen` project.
