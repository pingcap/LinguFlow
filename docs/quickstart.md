---
title: Quick Start
sidebar_label: Quick Start
sidebar_position: 2
---


# Quick Start

This quick start guide will assist you in building your LLM application with LinguFlow efficiently.

## Create a New Application in LinguFlow

1. Host the LinguFlow service [locally](deployment/local) or on [your own server](deployment/self_host).
2. Initiate a new [application](develop/application_and_version#application).
3. Generate a new [version](develop/application_and_version#version).

## Run an Example Application

1. Import an example application YAML file into the Builder.
2. Enter your OpenAI Key and any other required credentials.
3. Click the `Debug` button to test the application.

## Build Your DAG

1. Right-click or press `Space` to select blocks (including the essential `Input` & `Output` blocks).
2. Connect different [blocks'](develop/builder/blocks) imports and exports, ensuring data types match for a successful connection.
3. After completing the application's connections, click the [`Debug` button](develop/builder/debugging) to test the application.
4. Click `Save` to store this version.

## API Call Your Application

1. Click the `Publish` button to release the edited version.
2. Run your application using the asynchronous [API call](run/call_an_application).