"""Database access for event records."""

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.modules.eventos.entities.models import Evento


class EventoRepository:
    """CRUD operations for event records."""

    @staticmethod
    def get_all() -> list[Evento]:
        """Return all event records ordered by date descending."""
        statement = select(Evento).order_by(Evento.fecha.desc())
        return list(db.session.scalars(statement).all())

    @staticmethod
    def get_by_id(evento_id: int) -> Optional[Evento]:
        """Return the event record with the given primary key, if it exists."""
        return db.session.get(Evento, evento_id)

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Evento]:
        """Return event records for a given finca id, ordered by date descending."""
        statement = (
            select(Evento)
            .where(Evento.finca_id == finca_id)
            .order_by(Evento.fecha.desc())
        )
        return list(db.session.scalars(statement).all())

    @staticmethod
    def create(
        finca_id: int,
        fecha: str,
        titulo: str,
        tipo: str,
        estado: str = "Pendiente",
    ) -> Evento:
        """Create and persist a new event record."""
        evento = Evento(
            finca_id=finca_id,
            fecha=fecha,
            titulo=titulo,
            tipo=tipo,
            estado=estado,
        )
        db.session.add(evento)
        db.session.commit()
        return evento

    @staticmethod
    def update(
        evento: Evento,
        fecha: str | None = None,
        titulo: str | None = None,
        tipo: str | None = None,
        estado: str | None = None,
    ) -> Evento:
        """Update event fields and persist changes."""
        if fecha is not None:
            evento.fecha = fecha
        if titulo is not None:
            evento.titulo = titulo
        if tipo is not None:
            evento.tipo = tipo
        if estado is not None:
            evento.estado = estado
        db.session.commit()
        return evento

    @staticmethod
    def delete(evento: Evento) -> None:
        """Delete an event record from the database."""
        db.session.delete(evento)
        db.session.commit()
