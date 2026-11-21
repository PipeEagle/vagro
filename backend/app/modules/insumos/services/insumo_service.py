"""Business logic for input supply records."""

from decimal import Decimal

from app.modules.insumos.dtos.insumo_dtos import insumo_create_schema
from app.modules.insumos.entities.models import Insumo
from app.modules.insumos.repositories.insumo_repository import InsumoRepository
from app.modules.fincas.repositories.finca_repository import FincaRepository
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError


class InsumoService:
    """Business rules and validations for input supply records."""

    @staticmethod
    def list_all() -> list[Insumo]:
        """Return all input supply records."""
        return InsumoRepository.get_all()

    @staticmethod
    def get_by_id(insumo_id: int) -> Insumo:
        """Return an input supply record by id or raise a not-found error."""
        insumo = InsumoRepository.get_by_id(insumo_id)
        if insumo is None:
            raise AppException("Insumo no encontrado.", 404)
        return insumo

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Insumo]:
        """Return input supply records for a given finca."""
        return InsumoRepository.get_by_finca(finca_id)

    @staticmethod
    def create(
        finca_id: int,
        nombre: str,
        tipo: str,
        ingrediente: str | None = None,
        carencia: str | None = None,
        cantidad: Decimal | None = None,
        unidad: str | None = None,
    ) -> Insumo:
        """Validate and create a new input supply record."""
        if FincaRepository.get_by_id(finca_id) is None:
            raise AppException("La finca seleccionada no existe.", 400)
        if unidad is None:
            unidad = "kg"

        return InsumoRepository.create(
            finca_id=finca_id,
            nombre=nombre,
            tipo=tipo,
            ingrediente=ingrediente,
            carencia=carencia,
            cantidad=cantidad,
            unidad=unidad,
        )

    @staticmethod
    def update(
        insumo_id: int,
        nombre: str | None = None,
        tipo: str | None = None,
        ingrediente: str | None = None,
        carencia: str | None = None,
        cantidad: Decimal | None = None,
        unidad: str | None = None,
    ) -> Insumo:
        """Validate and update an existing input supply record."""
        insumo = InsumoService.get_by_id(insumo_id)
        return InsumoRepository.update(
            insumo,
            nombre=nombre,
            tipo=tipo,
            ingrediente=ingrediente,
            carencia=carencia,
            cantidad=cantidad,
            unidad=unidad,
        )

    @staticmethod
    def delete(insumo_id: int) -> None:
        """Delete an input supply record or raise not-found."""
        insumo = InsumoService.get_by_id(insumo_id)
        InsumoRepository.delete(insumo)
