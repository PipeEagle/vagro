"""Database access for administrator accounts."""

from sqlalchemy import select

from app.extensions import db
from app.modules.usuarios.entities.models import Usuario


class UserRepository:
    """Read administrator records from the database."""

    @staticmethod
    def get_by_username(username: str) -> Usuario | None:
        """Return the account with the given username, if it exists."""
        statement = select(Usuario).where(Usuario.username == username)
        return db.session.scalar(statement)

    @staticmethod
    def get_by_id(user_id: int) -> Usuario | None:
        """Return the account with the given primary key, if it exists."""
        return db.session.get(Usuario, user_id)
