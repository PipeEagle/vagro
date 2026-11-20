"""Business logic for agricultural labor records."""

from datetime import date

from app.modules.labores.entities.models import Labor
from app.modules.labores.repositories.labor_repository import LaborRepository
from app.shared.utils.app_exception import AppException


class LaborService:
    """Business rules and validations for labor records."""

    @staticmethod
    def list_all() -> list[Labor]:
        """Return all labor records."""
        return LaborRepository.get_all()

    @staticmethod
    def get_by_id(labor_id: int) -> Labor:
        """Return a labor record by id or raise a not-found error."""
        labor = LaborRepository.get_by_id(labor_id)
        if labor is None:
            raise AppException("Labor no encontrada.", 404)
        return labor

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Labor]:
        """Return labor records for a given finca."""
        return LaborRepository.get_by_finca(finca_id)

    @staticmethod
    def get_by_lote(lote_id: int) -> list[Labor]:
        """Return labor records for a given lote."""
        return LaborRepository.get_by_lote(lote_id)

    @staticmethod
    def create(
        finca_id: int,
        lote_id: int,
        tipo: str,
        fecha: date,
        estado: str | None = None,
        insumo: str | None = None,
        dosis: str | None = None,
        observaciones: str | None = None,
    ) -> Labor:
        """Validate and create a new labor record."""
        if estado is None:
            estado = "Programada"

        tipos_validos = {"siembra", "fertilizacion", "fumigacion", "poda", "riego", "cosecha"}
        if tipo not in tipos_validos:
            raise AppException(f"Tipo de labor invalido. Validos: {', '.join(sorted(tipos_validos))}.", 400)

        estados_validos = {"Programada", "Completada", "Pendiente", "Vencida"}
        if estado not in estados_validos:
            raise AppException(f"Estado invalido. Validos: {', '.join(sorted(estados_validos))}.", 400)

        return LaborRepository.create(
            finca_id=finca_id,
            lote_id=lote_id,
            tipo=tipo,
            fecha=fecha,
            estado=estado,
            insumo=insumo,
            dosis=dosis,
            observaciones=observaciones,
        )

    @staticmethod
    def update(
        labor_id: int,
        tipo: str | None = None,
        fecha: date | None = None,
        estado: str | None = None,
        insumo: str | None = None,
        dosis: str | None = None,
        observaciones: str | None = None,
    ) -> Labor:
        """Validate and update an existing labor record."""
        labor = LaborService.get_by_id(labor_id)

        tipos_validos = {"siembra", "fertilizacion", "fumigacion", "poda", "riego", "cosecha"}
        if tipo is not None and tipo not in tipos_validos:
            raise AppException(f"Tipo de labor invalido.", 400)

        estados_validos = {"Programada", "Completada", "Pendiente", "Vencida"}
        if estado is not None and estado not in estados_validos:
            raise AppException(f"Estado invalido.", 400)

        return LaborRepository.update(
            labor,
            tipo=tipo,
            fecha=fecha,
            estado=estado,
            insumo=insumo,
            dosis=dosis,
            observaciones=observaciones,
        )

    @staticmethod
    def delete(labor_id: int) -> None:
        """Delete a labor record or raise not-found."""
        labor = LaborService.get_by_id(labor_id)
        LaborRepository.delete(labor)
