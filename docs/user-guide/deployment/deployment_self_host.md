---
title: Self-Host Deployment
sidebar_label: Deployment/Self-Host
sidebar_position: 3.2
---

# Self-Host Deployment

LinguFlow Server, encompassing both the API and Web UI, is open-source and can be self-hosted using Docker, offering flexibility for deployment.

## Prerequisites: Database

A database is essential for storing LinguFlow's business data, including applications, versions, and interactions.

LinguFlow is compatible with [several databases](https://docs.sqlalchemy.org/en/20/dialects/index.html#support-levels-for-included-dialects). [TiDB Serverless](https://www.pingcap.com/tidb-serverless/) by PingCAP is recommended. It's a fully-managed, MySQL-compatible database that scales automatically and offers free quotas, making it an excellent choice for small development teams.

Regardless of the database selected, ensure you have the connection string ready once the database is set up.

## Configuring the Database

LinguFlow leverages [alembic](https://alembic.sqlalchemy.org/en/latest/) for automatic table structure creation. However, the database must be manually created first. For TiDB Serverless, execute `create database linguflow` via the Chat2Query page on its web console. For other databases, use the respective database client to connect and execute `create database linguflow`.

After creating the database, proceed with the automatic table structure creation:

```sh
# Install alembic
pip install alembic

# Initialize alembic in the LinguFlow directory
cd LinguFlow
alembic init alembic
sed -i '1s|^|import model\n|' alembic/env.py
sed -i "s|target_metadata =.*|target_metadata = model.Base.metadata|" alembic/env.py
sed -i "s|sqlalchemy.url =.*|sqlalchemy.url = <database_url>|" alembic.ini
alembic revision --autogenerate -m "init"
alembic upgrade head
```

**Note**: Replace `<database_url>` with your actual database connection string in SQLAlchemy format. For TiDB Serverless, it resembles:

```
mysql+pymysql://<USER>:<PASSWORD>@<HOST>:<PORT>/linguflow?ssl_ca=/etc/ssl/certs/ca-certificates.crt&ssl_verify_cert=true&ssl_verify_identity=true
```

## Deploying the Application

Before deployment, edit `docker-compose.yaml` to update the `DATABASE_URL` environment variable with your actual database URL. Then, on the production host:

```sh
docker-compose up -d
```

Access the LinguFlow page at `http://{your-public-ip}`.

## How to Update

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