"""Database access for crop catalog entries."""

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.modules.cultivos.entities.models import Cultivo


class CultivoRepository:
    """CRUD operations for crop catalog entries."""

    @staticmethod
    def get_all() -> list[Cultivo]:
        """Return all crops ordered by name."""
        statement = select(Cultivo).order_by(Cultivo.nombre.asc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(cultivo_id: int) -> Optional[Cultivo]:
        """Return the crop with the given primary key, if it exists."""
        return db.session.get(Cultivo, cultivo_id)

    @staticmethod
    def get_by_name(nombre: str) -> Optional[Cultivo]:
        """Return the crop with the given name, if it exists."""
        statement = select(Cultivo).where(Cultivo.nombre == nombre)
        return db.session.scalar(statement)

    @staticmethod
    def create(nombre: str, descripcion: str | None = None, ciclo_estimado_dias: int | None = None) -> Cultivo:
        """Create and persist a new crop entry."""
        cultivo = Cultivo(
            nombre=nombre,
            descripcion=descripcion,
            ciclo_estimado_dias=ciclo_estimado_dias,
        )
        db.session.add(cultivo)
        db.session.commit()
        return cultivo

    @staticmethod
    def update(
        cultivo: Cultivo,
        nombre: str | None = None,
        descripcion: str | None = None,
        ciclo_estimado_dias: int | None = None,
    ) -> Cultivo:
        """Update crop fields and persist changes."""
        if nombre is not None:
            cultivo.nombre = nombre
        if descripcion is not None:
            cultivo.descripcion = descripcion
        if ciclo_estimado_dias is not None:
            cultivo.ciclo_estimado_dias = ciclo_estimado_dias
        db.session.commit()
        return cultivo

    @staticmethod
    def delete(cultivo: Cultivo) -> None:
        """Delete a crop entry from the database."""
        db.session.delete(cultivo)
        db.session.commit()
