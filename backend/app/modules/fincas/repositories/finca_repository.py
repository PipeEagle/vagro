"""Database access for farm records."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.modules.fincas.entities.models import Finca
from app.shared.utils.app_exception import AppException


class FincaRepository:
    """CRUD operations for farm records."""

    @staticmethod
    def get_all() -> list[Finca]:
        """Return all farms ordered by name."""
        statement = select(Finca).order_by(Finca.nombre.asc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(finca_id: int) -> Optional[Finca]:
        """Return the farm with the given primary key, if it exists."""
        return db.session.get(Finca, finca_id)

    @staticmethod
    def create(
        nombre: str,
        municipio: str,
        departamento: str,
        estado: str = "ACTIVO",
    ) -> Finca:
        """Create and persist a new farm record."""
        finca = Finca(
            nombre=nombre,
            municipio=municipio,
            departamento=departamento,
            estado=estado,
        )
        db.session.add(finca)
        db.session.commit()
        return finca

    @staticmethod
    def update(
        finca: Finca,
        nombre: str | None = None,
        municipio: str | None = None,
        departamento: str | None = None,
        estado: str | None = None,
    ) -> Finca:
        """Update farm fields and persist changes."""
        if nombre is not None:
            finca.nombre = nombre
        if municipio is not None:
            finca.municipio = municipio
        if departamento is not None:
            finca.departamento = departamento
        if estado is not None:
            finca.estado = estado
        db.session.commit()
        return finca

    @staticmethod
    def delete(finca: Finca) -> None:
        """Delete a farm record from the database."""
        db.session.delete(finca)
        try:
            db.session.commit()
        except IntegrityError as error:
            db.session.rollback()
            raise AppException(
                "No se puede eliminar la finca porque tiene lotes o labores asociadas.", 409
            ) from error
