---
title: Application & Version
sidebar_label: Application & Version
sidebar_position: 4.1
---

# Application & Version

On LinguFlow, you can build your own LLM applications, each supporting multiple versions.

## Application

Create an application and assign it a meaningful name that reflects its business purpose. Each application should correspond to a specific business function, addressing a particular business challenge.

Applications can also [invoke each other](builder/blocks#invoke-category), enabling a modular approach to problem-solving.

### Optional: Enabling Tracing

When creating an application in LinguFlow, you have the option to enable [tracing](../run/tracing) by providing specific `LANGFUSE_SECRET_KEY` and `LANGFUSE_PUBLIC_KEY` for a [Langfuse Cloud](https://langfuse.com/) project. By entering the correct keys, tracing data will be transmitted to Langfuse Cloud during both debugging and production use of the application. This feature allows for enhanced monitoring and debugging capabilities by tracking the application's performance and behavior in real-time.

## Version

Within each application, you can create multiple versions. Assign each version a suitable name and manage them accordingly.

In an application, only one specific version can be designated as the `Published Version`. When you [run an Application](../run/call_an_application), it is this `Published Version` that is actually called.

When it's time to update a version, you can create a new version based on the existing `Published Version`. This new version can then be optimized and [debugged](builder/debugging). Once the new version meets all business requirements, it can be set as the new `Published Version`, ensuring a seamless transition and continuous improvement of your application.
