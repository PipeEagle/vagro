"""Database access for administrator accounts."""

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.modules.usuarios.entities.models import Usuario


class UserRepository:
    """Read and write administrator records from the database."""

    @staticmethod
    def get_all() -> list[Usuario]:
        """Return all users ordered by username."""
        statement = select(Usuario).order_by(Usuario.username.asc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_username(username: str) -> Usuario | None:
        """Return the account with the given username, if it exists."""
        statement = select(Usuario).where(Usuario.username == username)
        return db.session.scalar(statement)

    @staticmethod
    def get_by_id(user_id: int) -> Usuario | None:
        """Return the account with the given primary key, if it exists."""
        return db.session.get(Usuario, user_id)

    @staticmethod
    def create(
        username: str,
        password_hash: str,
        nombre_completo: str,
        rol: str,
        finca_id: int | None = None,
        estado: str = "Activo",
    ) -> Usuario:
        """Create and persist a new user account."""
        user = Usuario(
            username=username,
            password_hash=password_hash,
            nombre_completo=nombre_completo,
            rol=rol,
            finca_id=finca_id,
            estado=estado,
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def update(
        user: Usuario,
        nombre_completo: str | None = None,
        rol: str | None = None,
        finca_id: int | None = None,
        estado: str | None = None,
    ) -> Usuario:
        """Update user fields and persist changes."""
        if nombre_completo is not None:
            user.nombre_completo = nombre_completo
        if rol is not None:
            user.rol = rol
        if finca_id is not None:
            user.finca_id = finca_id
        if estado is not None:
            user.estado = estado
        db.session.commit()
        return user

    @staticmethod
    def delete(user: Usuario) -> None:
        """Delete a user account from the database."""
        db.session.delete(user)
        db.session.commit()
