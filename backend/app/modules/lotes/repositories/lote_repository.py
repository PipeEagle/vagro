"""Database access for agricultural plots."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.modules.lotes.entities.models import Lote
from app.shared.utils.app_exception import AppException


class LoteRepository:
    """CRUD operations for agricultural plots."""

    @staticmethod
    def get_all() -> list[Lote]:
        """Return all plots ordered by codigo_qr."""
        statement = select(Lote).order_by(Lote.codigo_qr.asc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(lote_id: int) -> Optional[Lote]:
        """Return the plot with the given primary key, if it exists."""
        return db.session.get(Lote, lote_id)

    @staticmethod
    def get_by_qr_code(codigo_qr: str) -> Lote | None:
        """Return the plot associated with a QR code, if it exists."""
        statement = select(Lote).where(Lote.codigo_qr == codigo_qr)
        return db.session.scalar(statement)

    @staticmethod
    def create(
        finca_id: int,
        cultivo_id: int,
        codigo_qr: str,
        nombre: str,
        hectareas: float,
        estado: str = "ACTIVO",
        fecha_siembra: str | None = None,
        estado_fenologico: str | None = None,
        arboles: int | None = None,
    ) -> Lote:
        """Create and persist a new plot record."""
        lote = Lote(
            finca_id=finca_id,
            cultivo_id=cultivo_id,
            codigo_qr=codigo_qr,
            nombre=nombre,
            hectareas=hectareas,
            estado=estado,
            fecha_siembra=fecha_siembra,
            estado_fenologico=estado_fenologico,
            arboles=arboles,
        )
        db.session.add(lote)
        db.session.commit()
        return lote

    @staticmethod
    def update(
        lote: Lote,
        nombre: str | None = None,
        hectareas: float | None = None,
        estado: str | None = None,
        cultivo_id: int | None = None,
    ) -> Lote:
        """Update plot fields and persist changes."""
        if nombre is not None:
            lote.nombre = nombre
        if hectareas is not None:
            lote.hectareas = hectareas
        if estado is not None:
            lote.estado = estado
        if cultivo_id is not None:
            lote.cultivo_id = cultivo_id
        db.session.commit()
        return lote

    @staticmethod
    def delete(lote: Lote) -> None:
        """Delete a plot record from the database."""
        db.session.delete(lote)
        try:
            db.session.commit()
        except IntegrityError as error:
            db.session.rollback()
            raise AppException(
                "No se puede eliminar el lote porque tiene labores asociadas.", 409
            ) from error
