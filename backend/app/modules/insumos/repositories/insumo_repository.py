"""Database access for input supply records."""

from decimal import Decimal
from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.modules.insumos.entities.models import Insumo


class InsumoRepository:
    """CRUD operations for input supply records."""

    @staticmethod
    def get_all() -> list[Insumo]:
        """Return all input supply records ordered by name."""
        statement = select(Insumo).order_by(Insumo.nombre.asc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(insumo_id: int) -> Optional[Insumo]:
        """Return the input supply record with the given primary key, if it exists."""
        return db.session.get(Insumo, insumo_id)

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Insumo]:
        """Return input supply records for a given finca id, ordered by name."""
        statement = (
            select(Insumo)
            .where(Insumo.finca_id == finca_id)
            .order_by(Insumo.nombre.asc())
        )
        return list(db.session.scalars(statement).all())

    @staticmethod
    def create(
        finca_id: int,
        nombre: str,
        tipo: str,
        ingrediente: str | None = None,
        carencia: str | None = None,
        cantidad: Decimal | None = None,
        unidad: str = "kg",
    ) -> Insumo:
        """Create and persist a new input supply record."""
        insumo = Insumo(
            finca_id=finca_id,
            nombre=nombre,
            tipo=tipo,
            ingrediente=ingrediente,
            carencia=carencia,
            cantidad=cantidad,
            unidad=unidad,
        )
        db.session.add(insumo)
        db.session.commit()
        return insumo

    @staticmethod
    def update(
        insumo: Insumo,
        nombre: str | None = None,
        tipo: str | None = None,
        ingrediente: str | None = None,
        carencia: str | None = None,
        cantidad: Decimal | None = None,
        unidad: str | None = None,
    ) -> Insumo:
        """Update input supply fields and persist changes."""
        if nombre is not None:
            insumo.nombre = nombre
        if tipo is not None:
            insumo.tipo = tipo
        if ingrediente is not None:
            insumo.ingrediente = ingrediente
        if carencia is not None:
            insumo.carencia = carencia
        if cantidad is not None:
            insumo.cantidad = cantidad
        if unidad is not None:
            insumo.unidad = unidad
        db.session.commit()
        return insumo

    @staticmethod
    def delete(insumo: Insumo) -> None:
        """Delete an input supply record from the database."""
        db.session.delete(insumo)
        db.session.commit()
