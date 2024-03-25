---
title: Local Deployment
sidebar_label: Deployment/Local
sidebar_position: 3.1
---

# Local Deployment

Deploy LinguFlow on your local machine using Docker Compose. This setup is perfect for developing, testing LinguFlow applications, and diagnosing integration issues.

**Requirements**: Docker and Docker Compose, both of which are part of [Docker Desktop](https://docs.docker.com/get-docker/) for Mac or Windows users.

## Getting Started

Follow these steps to get LinguFlow up and running on your local environment:

```sh
# Clone the LinguFlow repository
git clone git@github.com:pingcap/LinguFlow.git
# Navigate into the LinguFlow directory
cd LinguFlow

# Start the UI and API server
docker-compose -f docker-compose.dev.yaml up
```

-> You can now access Langfuse at http://localhost:5173

## Updating Langfuse

To update LinguFlow to the latest version locally, a simple `git pull` is usually sufficient. However, there are two exceptions:

- When the dependencies of `LinguFlow` have been updated (as listed in requirements.txt).
- When the model of `LinguFlow` has been updated (as defined in model.py).

In these scenarios, you'll need to rebuild the LinguFlow Docker image by running:

```sh
docker-compose -f docker-compose.dev.yaml build
```
