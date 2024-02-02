from typing import List

from sqlalchemy.engine.base import Engine
from sqlalchemy.orm import Session

from model import Application, ApplicationVersion, Interaction


class Database:
    """
    The class Database contains a series of methods for interacting with a database.
    """

    def __init__(self, engine: Engine):
        self.engine = engine

    def list_applications(self) -> List[Application]:
        with Session(self.engine) as session:
            return (
                session.query(Application).filter(Application.deleted_at == None).all()
            )

    def create_application(self, app: Application):
        with Session(self.engine) as session:
            session.add(app)
            session.commit()

    def get_application(self, app_id: str) -> Application:
        with Session(self.engine) as session:
            return session.query(Application).filter(Application.id == app_id).first()

    def get_interaction(self, interaction_id: str) -> Interaction:
        with Session(self.engine) as session:
            return (
                session.query(Interaction)
                .filter(Interaction.id == interaction_id)
                .first()
            )

    def create_interaction(self, interaction: Interaction):
        with Session(self.engine) as session:
            session.add(interaction)
            session.commit()

    def update_interaction(self, interaction_id: str, attrs: dict):
        with Session(self.engine) as session:
            session.query(Interaction).filter(Interaction.id == interaction_id).update(
                attrs
            )
            session.commit()

    def update_application(self, app_id: str, attrs: dict):
        with Session(self.engine) as session:
            session.query(Application).filter(Application.id == app_id).update(attrs)
            session.commit()

    def list_versions(self, app_id: str) -> List[ApplicationVersion]:
        with Session(self.engine) as session:
            return (
                session.query(ApplicationVersion)
                .filter(ApplicationVersion.app_id == app_id)
                .filter(ApplicationVersion.deleted_at == None)
                .all()
            )

    def get_version(self, version_id: str) -> Application:
        with Session(self.engine) as session:
            return (
                session.query(ApplicationVersion)
                .filter(ApplicationVersion.id == version_id)
                .first()
            )

    def create_version(self, version: ApplicationVersion):
        with Session(self.engine) as session:
            session.add(version)
            session.commit()

    def update_version(self, version_id: str, attrs: dict):
        with Session(self.engine) as session:
            session.query(ApplicationVersion).filter(
                ApplicationVersion.id == version_id
            ).update(attrs)
            session.commit()
