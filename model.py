from datetime import datetime

from sqlalchemy import BOOLEAN, JSON, TEXT, TIMESTAMP, Column, Index, String
from sqlalchemy.ext.declarative import declarative_base

"""
A base class is required to define models:

https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html

We build three models in the module:

 ------                     ---------                     ------------
| app  | --- has many ---> | version | --- has many ---> | iteraction |
 ------                     ---------                     ------------

App is the container of versions. But only one version can be active.
Each version (except the first one of every app) contains a parent version, which
means the versions construct a tree instead of a list. The version has a configuration
which stores the DAG. The DAG defines how to interact with LLM and how to deal with
input data. Each time the DAG is executed, a new iteraction is produced. The iteraction
stores all data the DAG nodes produced.
"""
Base = declarative_base()


class Application(Base):
    """
    Application models app. An app has many versions but only one of them are active.
    Each time the app is called, the active_version's configration is used to build
    the DAG, and then produce the interaction record.
    """

    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, nullable=False)
    name = Column(String(255), nullable=False)
    active_version = Column(String(36), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    deleted_at = Column(TIMESTAMP, nullable=True)

    deleted_at_index = Index("ix_application_deleted_at", deleted_at)


class ApplicationVersion(Base):
    """
    ApplicationVersion models version of app. It is mainly used to store DAG configurations.
    """

    __tablename__ = "versions"

    id = Column(String(36), primary_key=True, nullable=False)
    name = Column(String(36), nullable=False)
    parent_id = Column(String(36), nullable=True)
    app_id = Column(String(36), nullable=False)
    meta = Column(JSON, nullable=True)
    configuration = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    deleted_at = Column(TIMESTAMP, nullable=True)

    application_index = Index("ix_version_app_id", app_id)
    created_at_index = Index("ix_version_created_at", created_at)
    deleted_at_index = Index("ix_version_deleted_at", deleted_at)


class Interaction(Base):
    """
    Interaction records every interaction with a specific app version.
    """

    __tablename__ = "interactions"

    id = Column(String(36), primary_key=True, nullable=False)
    app_id = Column(String(36), nullable=False)
    version_id = Column(String(36), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    output = Column(TEXT, nullable=True)
    data = Column(JSON, nullable=True)
    error = Column(JSON, nullable=True)

    version_index = Index("ix_interactions_version_id", version_id)
    created_at_index = Index("ix_interactions_created_at", created_at)
