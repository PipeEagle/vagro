"""Business logic for crop catalog management."""

from app.modules.cultivos.entities.models import Cultivo
from app.modules.cultivos.repositories.cultivo_repository import CultivoRepository
from app.shared.utils.app_exception import AppException


class CultivoService:
    """Business rules and validations for crop catalog entries."""

    @staticmethod
    def list_all() -> list[Cultivo]:
        """Return all crop entries."""
        return CultivoRepository.get_all()

    @staticmethod
    def get_by_id(cultivo_id: int) -> Cultivo:
        """Return a crop by id or raise a not-found error."""
        cultivo = CultivoRepository.get_by_id(cultivo_id)
        if cultivo is None:
            raise AppException("Cultivo no encontrado.", 404)
        return cultivo

    @staticmethod
    def create(nombre: str, descripcion: str | None = None, ciclo_estimado_dias: int | None = None) -> Cultivo:
        """Validate and create a new crop entry."""
        nombre = nombre.strip()
        if not nombre:
            raise AppException("El nombre del cultivo es obligatorio.", 400)

        if CultivoRepository.get_by_name(nombre):
            raise AppException("Ya existe un cultivo con ese nombre.", 409)

        return CultivoRepository.create(nombre=nombre, descripcion=descripcion, ciclo_estimado_dias=ciclo_estimado_dias)

    @staticmethod
    def update(
        cultivo_id: int,
        nombre: str | None = None,
        descripcion: str | None = None,
        ciclo_estimado_dias: int | None = None,
    ) -> Cultivo:
        """Validate and update an existing crop entry."""
        cultivo = CultivoService.get_by_id(cultivo_id)

        if nombre is not None:
            nombre = nombre.strip()
            if not nombre:
                raise AppException("El nombre del cultivo es obligatorio.", 400)
            existing = CultivoRepository.get_by_name(nombre)
            if existing and existing.id != cultivo_id:
                raise AppException("Ya existe un cultivo con ese nombre.", 409)

        return CultivoRepository.update(
            cultivo, nombre=nombre, descripcion=descripcion, ciclo_estimado_dias=ciclo_estimado_dias
        )

    @staticmethod
    def delete(cultivo_id: int) -> None:
        """Delete a crop entry or raise not-found."""
        cultivo = CultivoService.get_by_id(cultivo_id)
        CultivoRepository.delete(cultivo)
