---
title: Application & Version
sidebar_label: Application & Version
sidebar_position: 4.1
---

# Application & Version

On LinguFlow, you can build your own LLM applications, each supporting multiple versions.

## Application

Create an application and assign it a meaningful name that reflects its business purpose. Each application should correspond to a specific business function, addressing a particular business challenge. 

Applications can also [invoke each other](https://github.com/pingcap/LinguFlow), enabling a modular approach to problem-solving.

## Version

Within each application, you can create multiple versions. Assign each version a suitable name and manage them accordingly. 

In an application, only one specific version can be designated as the `Published Version`. When you [run an Application](https://github.com/pingcap/LinguFlow), it is this `Published Version` that is actually called.

When it's time to update a version, you can create a new version based on the existing `Published Version`. This new version can then be optimized and [tested](https://github.com/pingcap/LinguFlow). Once the new version meets all business requirements, it can be set as the new `Published Version`, ensuring a seamless transition and continuous improvement of your application.