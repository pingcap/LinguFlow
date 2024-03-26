:construction: This repository is currently under construction. Stay tuned – it's coming soon!

# LinguFlow

## Local Deployment

You can run LinguFlow on your local machine using docker compose. This method is ideal for developing & testing LinguFlow and troubleshooting integration issues.

Requirements: docker and docker compose, both are included in [Docker Desktop](https://docs.docker.com/get-docker/) for Mac or Windows users.

### Getting Started

```sh
git clone git@github.com:pingcap/LinguFlow.git
cd LinguFlow

# start the ui and api server
docker-compose -f docker-compose.dev.yaml up
```

-> Now, you can access Langfuse at http://localhost:5173

### Updating Langfuse

Most of the time, you only need to execute `git pull` to use the latest code of LinguFlow locally, except for two exceptions:

- The dependencies of `LinguFlow` have been updated (in requirements.txt)
- The model of `LinguFlow` has been updated (in model.py)

In these two cases, you need to execute `docker-compose -f docker-compose.dev.yaml build` to rebuild the image of LinguFlow.

## Self-Hosting Guide

LinguFlow Server, which includes the API and Web UI, is open-source and can be self-hosted using Docker.

### Prerequisites: Database

A database is required to store the business data of LinguFlow, including applications, versions, and interactions.

LinguFlow can support [these](https://docs.sqlalchemy.org/en/20/dialects/index.html#support-levels-for-included-dialects) databases, and it is recommended to use [TiDB Serverless](https://www.pingcap.com/tidb-serverless/) produced by PingCAP. It is a fully-managed MySQL compatible database that can automatically scale and provides free quotas, making it the first choice for small development teams.

No matter which database you choose, once the database is ready, keep the connection string handy.

### Configure the Database

LinguFlow's model supports the automatic creation of table structures using [alembic](https://alembic.sqlalchemy.org/en/latest/). However, before this, you need to manually create the database. For TiDB Serverless, you can directly execute the SQL `create database linguflow` on the Chat2Query page of its web console. For other databases, you can use the corresponding client of the database to connect and execute `create database linguflow` to create it.

Once the database is created, you can start the automatic creation of table structures. 

Execute the following commands to initialize the database:

```sh
# First, install alembic
pip install alembic

# Initialize alembic
cd LinguFlow
alembic init alembic
sed -i '1s|^|import model\n|' alembic/env.py
sed -i "s|target_metadata =.*|target_metadata = model.Base.metadata|" alembic/env.py
sed -i "s|sqlalchemy.url =.*|sqlalchemy.url = <database_url>|" alembic.ini
alembic revision --autogenerate -m "init"
alembic upgrade head
```

Note: Please replace `<database_url>` in the above command with the actual SQLAIchemy format database connection address. For TiDB Serverless, it looks like:

```
mysql+pymysql://2ogML5E9iFqsVWA.root:<PASSWORD>@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/linguflow?ssl_ca=/etc/ssl/certs/ca-certificates.crt&ssl_verify_cert=true&ssl_verify_identity=true
```

### Deploying the Application

To boostrap the application, you should firstly edit `docker-compose.yaml` and change the `DATABASE_URL` environment to the above real database url. Then on the production host:

```sh
docker-compose up -d
```

Then you can access LinguFlow page on http://{your-public-ip}.

### How to update

To update the application:

```sh
cd LinguFlow
docker-compose down
git pull
docker-compose build --no-cache
alembic revision --autogenerate -m "update schema if any necessary database migrations"
alembic upgrade head
docker-compose up
```

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
