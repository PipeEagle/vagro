"""Business logic for event records."""

from app.modules.eventos.dtos.evento_dtos import evento_create_schema
from app.modules.eventos.entities.models import Evento
from app.modules.eventos.repositories.evento_repository import EventoRepository
from app.modules.fincas.repositories.finca_repository import FincaRepository
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError


class EventoService:
    """Business rules and validations for event records."""

    @staticmethod
    def list_all() -> list[Evento]:
        """Return all event records."""
        return EventoRepository.get_all()

    @staticmethod
    def get_by_id(evento_id: int) -> Evento:
        """Return an event record by id or raise a not-found error."""
        evento = EventoRepository.get_by_id(evento_id)
        if evento is None:
            raise AppException("Evento no encontrado.", 404)
        return evento

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Evento]:
        """Return event records for a given finca."""
        return EventoRepository.get_by_finca(finca_id)

    @staticmethod
    def create(
        finca_id: int,
        fecha: str,
        titulo: str,
        tipo: str,
        estado: str | None = None,
    ) -> Evento:
        """Validate and create a new event record."""
        if FincaRepository.get_by_id(finca_id) is None:
            raise AppException("La finca seleccionada no existe.", 400)
        if estado is None:
            estado = "Pendiente"

        estados_validos = {"Pendiente", "Completada", "Vencida"}
        if estado not in estados_validos:
            raise AppException(f"Estado invalido. Validos: {', '.join(sorted(estados_validos))}.", 400)

        return EventoRepository.create(
            finca_id=finca_id,
            fecha=fecha,
            titulo=titulo,
            tipo=tipo,
            estado=estado,
        )

    @staticmethod
    def update(
        evento_id: int,
        fecha: str | None = None,
        titulo: str | None = None,
        tipo: str | None = None,
        estado: str | None = None,
    ) -> Evento:
        """Validate and update an existing event record."""
        evento = EventoService.get_by_id(evento_id)

        if estado is not None:
            estados_validos = {"Pendiente", "Completada", "Vencida"}
            if estado not in estados_validos:
                raise AppException(f"Estado invalido.", 400)

        return EventoRepository.update(
            evento,
            fecha=fecha,
            titulo=titulo,
            tipo=tipo,
            estado=estado,
        )

    @staticmethod
    def delete(evento_id: int) -> None:
        """Delete an event record or raise not-found."""
        evento = EventoService.get_by_id(evento_id)
        EventoRepository.delete(evento)
