"""Database access for harvest records."""

from datetime import date
from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.modules.cosechas.entities.models import Cosecha


class CosechaRepository:
    """CRUD operations for harvest records."""

    @staticmethod
    def get_all() -> list[Cosecha]:
        """Return all harvest records ordered by date descending."""
        statement = select(Cosecha).order_by(Cosecha.fecha.desc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(cosecha_id: int) -> Optional[Cosecha]:
        """Return the harvest record with the given primary key, if it exists."""
        return db.session.get(Cosecha, cosecha_id)

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Cosecha]:
        """Return harvest records for a given finca id, ordered by date descending."""
        statement = (
            select(Cosecha)
            .where(Cosecha.finca_id == finca_id)
            .order_by(Cosecha.fecha.desc())
        )
        return list(db.session.scalars(statement).all())

    @staticmethod
    def create(
        finca_id: int,
        lote_codigo_qr: str,
        fecha: date,
        cantidad: float,
        unidad: str,
        calidad: str = "Primera",
        estado: str = "Pendiente",
    ) -> Cosecha:
        """Create and persist a new harvest record."""
        cosecha = Cosecha(
            finca_id=finca_id,
            lote_codigo_qr=lote_codigo_qr,
            fecha=fecha,
            cantidad=cantidad,
            unidad=unidad,
            calidad=calidad,
            estado=estado,
        )
        db.session.add(cosecha)
        db.session.commit()
        return cosecha

    @staticmethod
    def update(
        cosecha: Cosecha,
        lote_codigo_qr: str | None = None,
        fecha: date | None = None,
        cantidad: float | None = None,
        unidad: str | None = None,
        calidad: str | None = None,
        estado: str | None = None,
    ) -> Cosecha:
        """Update harvest fields and persist changes."""
        if lote_codigo_qr is not None:
            cosecha.lote_codigo_qr = lote_codigo_qr
        if fecha is not None:
            cosecha.fecha = fecha
        if cantidad is not None:
            cosecha.cantidad = cantidad
        if unidad is not None:
            cosecha.unidad = unidad
        if calidad is not None:
            cosecha.calidad = calidad
        if estado is not None:
            cosecha.estado = estado
        db.session.commit()
        return cosecha

    @staticmethod
    def delete(cosecha: Cosecha) -> None:
        """Delete a harvest record from the database."""
        db.session.delete(cosecha)
        db.session.commit()
