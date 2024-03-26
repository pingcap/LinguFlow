:construction: This repository is currently under construction. Stay tuned – it's coming soon!

# LinguFlow

## What is LinguFlow

LinguFlow, a low-code tool designed for LLM application development, simplifies the building, debugging, and deployment process for developers. It utilizes a DAG-based message flow for business logic, requiring only minimal familiarity with LinguFlow blocks to effectively use.

### Why we need LinguFlow?

When attempting to apply LLM to real-world business scenarios, the limitations of using a simple LLM Wrapper become evident. These limitations include:

- Difficulty in further improving accuracy.
- The inability to restrict the conversation to business-relevant topics only.
- Challenges in handling complex business processes.

LinguFlow is needed precisely to overcome these challenges, offering a platform that enables the structured building of LLM applications tailored to specific business needs and enhancing their accuracy over time. The most classic approach to deploying applications with LLM (Large Language Models) is through the construction of a [DAG (Directed Acyclic Graph)](https://en.wikipedia.org/wiki/Directed_acyclic_graph). 

### the features with LinguFlow

Thus, the features of applications developed with LinguFlow include:

- **Technical Characteristics**:
  - Construction based on a DAG of information flows.
  - Multiple interactions with an LLM (for example, a Chatbot might interact with an LLM four times to answer a single customer query) where each interaction addresses a specific issue, such as intent determination, rephrasing, answering, or critique. This approach effectively overcomes the limitations of single interactions and supports the development of relatively complex applications.

- **Business Characteristics**:
  - LinguFlow is suitable for those with a clear understanding of how to solve their business problems using LLM, particularly when supporting more complex logic and requiring higher accuracy. As LinguFlow is based on the construction of DAG, similar to traditional application development, it is also well-suited for diving into complex business scenarios.

In essence, LinguFlow's design and implementation method offer a structured and logical framework for integrating LLMs into complex business processes, emphasizing the accuracy and logic-specific solutions of LLM interactions.

## Get Started

### Localhost (docker)

You can run LinguFlow on your local machine using [docker](https://docs.docker.com/get-docker/) compose. This setup is perfect for developing, testing LinguFlow applications, and diagnosing integration issues.

```sh
# Clone the LinguFlow repository
git clone git@github.com:pingcap/LinguFlow.git
# Navigate into the LinguFlow directory
cd LinguFlow

# Start the UI and API server
docker-compose -f docker-compose.dev.yaml up
```

-> You can now access LinguFlow at http://localhost:5173. More about deploying locally.

### Self-Hosting (docker)

LinguFlow Server, which includes the API and Web UI, is open-source and can be self-hosted using Docker.

-> More about deploying self-host.

### API Call

1. Click the Connect App button within the App.
2. Follow the instructions to use the POST API to call the asynchronous interface, obtaining the interaction id for this interaction.
3. Use the GET API to query the previously obtained interaction id, retrieving the final response from the LinguFlow application.

-> More about APIs.

## License

This repository is MIT licensed, except for the ee/ folder. See [LICENSE](LICENSE) for more details.