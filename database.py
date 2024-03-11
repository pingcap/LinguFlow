from typing import List

from sqlalchemy.engine.base import Engine
from sqlalchemy.orm import Session

from model import Application, ApplicationVersion, Interaction


class Database:
    """
    The class Database contains a series of methods for interacting with a database.
    """

    def __init__(self, engine: Engine):
        """
        Args:
            engine (Engine): sqlalchemy engine.
        """
        self.engine = engine

    def list_applications(self) -> List[Application]:
        """
        Retrieve a list of non-deleted applications from the database.

        Returns:
            List[Application]: A list of Application objects.
        """
        with Session(self.engine) as session:
            return (
                session.query(Application)
                .filter(Application.deleted_at == None)
                .order_by(Application.created_at.desc())
                .all()
            )

    def create_application(self, app: Application):
        """
        Adds a new application to the database.

        Args:
            app (Application): The application object to be added.

        Returns:
            None
        """
        with Session(self.engine) as session:
            session.add(app)
            session.commit()

    def get_application(self, app_id: str) -> Application:
        """
        Retrieve an application by its ID.

        Args:
            app_id (str): The ID of the application to retrieve.

        Returns:
            Application: The application object corresponding to the given ID, or None if not found.
        """
        with Session(self.engine) as session:
            return session.query(Application).filter(Application.id == app_id).first()

    def get_interaction(self, interaction_id: str) -> Interaction:
        """
        Retrieve an interaction from the database by its ID.

        Args:
            interaction_id (str): The ID of the interaction to retrieve.

        Returns:
            Interaction: The retrieved interaction object.
        """
        with Session(self.engine) as session:
            return (
                session.query(Interaction)
                .filter(Interaction.id == interaction_id)
                .first()
            )

    def create_interaction(self, interaction: Interaction):
        """
        Add a new interaction to the database.

        Args:
            interaction (Interaction): An instance of the Interaction class
                representing the interaction data to be added.

        Returns:
            None
        """
        with Session(self.engine) as session:
            session.add(interaction)
            session.commit()

    def update_interaction(self, interaction_id: str, attrs: dict):
        """
        Update an Interaction record in the database with the specified ID.

        Args:
            interaction_id (str): The ID of the Interaction record to update.
            attrs (dict): A dictionary containing the attributes to update.
                The keys should correspond to the column names of the interactions
                table in the database, and the values should be the new values for
                those attributes.

        Returns:
            None

        Example usage:
        ```
        attrs = {
            'data': {...},
            'output': 'output value'
        }
        database.update_interaction('interaction_id_here', attrs)
        ```
        """
        with Session(self.engine) as session:
            session.query(Interaction).filter(Interaction.id == interaction_id).update(
                attrs
            )
            session.commit()

    def update_application(self, app_id: str, attrs: dict):
        """
        Update an application in the database with the specified attributes.

        Args:
            app_id (str): The ID of the application to update.
            attrs (dict): A dictionary containing the attributes to update.

        Returns:
            None
        """
        with Session(self.engine) as session:
            session.query(Application).filter(Application.id == app_id).update(attrs)
            session.commit()

    def update_version(self, version_id: str, attrs: dict):
        """
        Update an version in the database with the specified attributes.

        Args:
            version_id (str): The ID of the version to update.
            attrs (dict): A dictionary containing the attributes to update.

        Returns:
            None
        """
        with Session(self.engine) as session:
            session.query(ApplicationVersion).filter(
                ApplicationVersion.id == version_id
            ).update(attrs)
            session.commit()

    def list_versions(self, app_id: str) -> List[ApplicationVersion]:
        """
        Retrieve all non-deleted versions of an application by app_id.

        Args:
            app_id (str): The ID of the application to retrieve versions for.

        Returns:
            List[ApplicationVersion]: A list of ApplicationVersion objects
                representing the non-deleted versions.
        """
        with Session(self.engine) as session:
            return (
                session.query(ApplicationVersion)
                .filter(ApplicationVersion.app_id == app_id)
                .filter(ApplicationVersion.deleted_at == None)
                .order_by(ApplicationVersion.created_at.desc())
                .all()
            )

    def get_version(self, version_id: str) -> ApplicationVersion:
        """
        Retrieve an application version by its ID.

        Args:
            version_id (str): The ID of the application version to retrieve.

        Returns:
            ApplicationVersion: The application version object corresponding to the given ID.
        """
        with Session(self.engine) as session:
            return (
                session.query(ApplicationVersion)
                .filter(ApplicationVersion.id == version_id)
                .first()
            )

    def create_version(self, version: ApplicationVersion):
        """
        Create a new application version in the database.

        Args:
            version (ApplicationVersion): The application version object to be added.

        Returns:
            None
        """
        with Session(self.engine) as session:
            session.add(version)
            session.commit()

    def update_version(self, version_id: str, attrs: dict):
        """
        Update the attributes of an application version in the database.

        Args:
            version_id (str): The ID of the version to update.
            attrs (dict): A dictionary containing the attributes to update and their new values.
        """
        with Session(self.engine) as session:
            session.query(ApplicationVersion).filter(
                ApplicationVersion.id == version_id
            ).update(attrs)
            session.commit()
