"""Database access for agricultural labor records."""

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.modules.labores.entities.models import Labor


class LaborRepository:
    """CRUD operations for agricultural labor records."""

    @staticmethod
    def get_all() -> list[Labor]:
        """Return all labor records ordered by date descending."""
        statement = select(Labor).order_by(Labor.fecha.desc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(labor_id: int) -> Optional[Labor]:
        """Return the labor record with the given primary key, if it exists."""
        return db.session.get(Labor, labor_id)

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Labor]:
        """Return labor records for a given finca id, ordered by date descending."""
        statement = select(Labor).where(Labor.finca_id == finca_id).order_by(Labor.fecha.desc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_lote(lote_id: int) -> list[Labor]:
        """Return labor records for a given lote id, ordered by date descending."""
        statement = select(Labor).where(Labor.lote_id == lote_id).order_by(Labor.fecha.desc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def create(
        finca_id: int,
        lote_id: int,
        tipo: str,
        fecha: date,
        estado: str = "Programada",
        insumo: str | None = None,
        dosis: str | None = None,
        observaciones: str | None = None,
    ) -> Labor:
        """Create and persist a new labor record."""
        labor = Labor(
            finca_id=finca_id,
            lote_id=lote_id,
            tipo=tipo,
            fecha=fecha,
            estado=estado,
            insumo=insumo,
            dosis=dosis,
            observaciones=observaciones,
        )
        db.session.add(labor)
        db.session.commit()
        return labor

    @staticmethod
    def update(
        labor: Labor,
        tipo: str | None = None,
        fecha: date | None = None,
        estado: str | None = None,
        insumo: str | None = None,
        dosis: str | None = None,
        observaciones: str | None = None,
    ) -> Labor:
        """Update labor fields and persist changes."""
        if tipo is not None:
            labor.tipo = tipo
        if fecha is not None:
            labor.fecha = fecha
        if estado is not None:
            labor.estado = estado
        if insumo is not None:
            labor.insumo = insumo
        if dosis is not None:
            labor.dosis = dosis
        if observaciones is not None:
            labor.observaciones = observaciones
        db.session.commit()
        return labor

    @staticmethod
    def delete(labor: Labor) -> None:
        """Delete a labor record from the database."""
        db.session.delete(labor)
        db.session.commit()
