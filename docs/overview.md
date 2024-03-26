---
title: Overview
sidebar_label: Overview
sidebar_position: 1
---

# Overview

Welcome to the LinguFlow User Guide! LinguFlow is a cutting-edge LLM (Large Language Model) application builder that facilitates the creation of LLM applications through a visual, [DAG(Directed Acyclic Graph)](https://en.wikipedia.org/wiki/Directed_acyclic_graph)-based interface.

This guide is designed to familiarize you with the capabilities of LinguFlow and navigate you through its wide array of features and functionalities.

After reading, feel free to dive into the [QuickStart](quickstart) section to get hands-on experience with LinguFlow.

## Key Features

### Development

- **LinguFlow UI**: After deployment ([locally](deployment/local) or [self-hosted](deployment/self_host)), you can manage your LLM applications within an organized framework of [Apps and Versions](develop/application_and_version).
    - **App**: Each LLM application is recognized as an `application`, which can be executed directly using its `application_id` during production.
    - **Version**: Each App can house multiple versions, with one specified as the `published version`. Each version can be independently edited.
- **Builder**: Opening a version reveals the [Builder](develop/builder/summary), where application logic can be crafted using a DAG (Directed Acyclic Graph) methodology.
    - **Block**: [Blocks](develop/builder/blocks) serve as the nodes within the DAG, each embodying a distinct processing logic. Block types encompass input, output, LLM, third-party tools, numerical processing, and the invocation of other LinguFlow applications.
    - **Line**: [Lines](develop/builder/summary#lines) link Blocks within the DAG, differentiated into data lines and decision lines (True/False).
- **Debugging**: The [Debugging](develop/builder/debugging) feature enables swift testing of a version post-application construction.

### Usage

- **Call an application**: Execute LinguFlow applications asynchronously through API [calls](run/call_an_application), leveraging the `published version` of an application.
<!-- - **Tracing**: LinguFlow utilizes LangFuse as its [Tracing](run/tracing) instrument, documenting every user interaction. -->
<!-- - **Feedback**: The [Feedback](run/feedbacks) API allows for the provision of feedback on each interaction, with outcomes logged in LangFuse. -->