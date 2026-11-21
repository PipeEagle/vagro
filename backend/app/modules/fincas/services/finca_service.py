"""Business logic for farm records."""

from app.modules.fincas.dtos.finca_dtos import finca_create_schema
from app.modules.fincas.entities.models import Finca
from app.modules.fincas.repositories.finca_repository import FincaRepository
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError


class FincaService:
    """Business rules and validations for farm records."""

    @staticmethod
    def list_all() -> list[Finca]:
        """Return all farm records."""
        return FincaRepository.get_all()

    @staticmethod
    def get_by_id(finca_id: int) -> Finca:
        """Return a farm by id or raise a not-found error."""
        finca = FincaRepository.get_by_id(finca_id)
        if finca is None:
            raise AppException("Finca no encontrada.", 404)
        return finca

    @staticmethod
    def create(nombre: str, municipio: str, departamento: str, estado: str | None = None) -> Finca:
        """Validate and create a new farm record."""
        if estado is None:
            estado = "ACTIVO"

        estados_validos = {"ACTIVO", "EN_DESCANSO", "FINALIZADO"}
        if estado not in estados_validos:
            raise AppException(f"Estado invalido. Validos: {', '.join(sorted(estados_validos))}.", 400)

        return FincaRepository.create(
            nombre=nombre,
            municipio=municipio,
            departamento=departamento,
            estado=estado,
        )

    @staticmethod
    def update(
        finca_id: int,
        nombre: str | None = None,
        municipio: str | None = None,
        departamento: str | None = None,
        estado: str | None = None,
    ) -> Finca:
        """Validate and update an existing farm record."""
        finca = FincaService.get_by_id(finca_id)

        if estado is not None:
            estados_validos = {"ACTIVO", "EN_DESCANSO", "FINALIZADO"}
            if estado not in estados_validos:
                raise AppException(f"Estado invalido.", 400)

        return FincaRepository.update(
            finca,
            nombre=nombre,
            municipio=municipio,
            departamento=departamento,
            estado=estado,
        )

    @staticmethod
    def delete(finca_id: int) -> None:
        """Delete a farm record or raise not-found."""
        finca = FincaService.get_by_id(finca_id)
        FincaRepository.delete(finca)
