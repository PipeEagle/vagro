"""Business logic for agricultural plots."""

from app.modules.lotes.dtos.lote_dtos import lote_create_schema
from app.modules.lotes.entities.models import Lote
from app.modules.lotes.repositories.lote_repository import LoteRepository
from app.modules.cultivos.repositories.cultivo_repository import CultivoRepository
from app.modules.fincas.repositories.finca_repository import FincaRepository
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError


class LoteService:
    """Business rules and validations for plot records."""

    @staticmethod
    def list_all() -> list[Lote]:
        """Return all plot records."""
        return LoteRepository.get_all()

    @staticmethod
    def get_by_id(lote_id: int) -> Lote:
        """Return a plot by id or raise a not-found error."""
        lote = LoteRepository.get_by_id(lote_id)
        if lote is None:
            raise AppException("Lote no encontrado.", 404)
        return lote

    @staticmethod
    def get_by_qr_code(codigo_qr: str) -> dict:
        """Return public plot details only when the plot is active."""
        from app.modules.lotes.dtos.lote_dtos import lote_public_schema

        lote = LoteRepository.get_by_qr_code(codigo_qr)
        if lote is None or lote.estado != "ACTIVO":
            raise AppException("No se encontro un lote activo para ese codigo QR.", 404)
        return lote_public_schema.dump(lote)

    @staticmethod
    def create(
        finca_id: int,
        cultivo_id: int,
        codigo_qr: str,
        nombre: str,
        hectareas: float,
        estado: str | None = None,
        fecha_siembra: str | None = None,
        estado_fenologico: str | None = None,
        arboles: int | None = None,
    ) -> Lote:
        """Validate and create a new plot record."""
        if LoteRepository.get_by_qr_code(codigo_qr):
            raise AppException("El codigo QR ya existe.", 400)
        if FincaRepository.get_by_id(finca_id) is None:
            raise AppException("La finca seleccionada no existe.", 400)
        if CultivoRepository.get_by_id(cultivo_id) is None:
            raise AppException("El cultivo seleccionado no existe.", 400)

        if estado is None:
            estado = "ACTIVO"

        estados_validos = {"ACTIVO", "EN_DESCANSO", "FINALIZADO"}
        if estado not in estados_validos:
            raise AppException(f"Estado invalido. Validos: {', '.join(sorted(estados_validos))}.", 400)

        return LoteRepository.create(
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

    @staticmethod
    def update(
        lote_id: int,
        nombre: str | None = None,
        hectareas: float | None = None,
        estado: str | None = None,
        cultivo_id: int | None = None,
    ) -> Lote:
        """Validate and update an existing plot record."""
        lote = LoteService.get_by_id(lote_id)

        if cultivo_id is not None and CultivoRepository.get_by_id(cultivo_id) is None:
            raise AppException("El cultivo seleccionado no existe.", 400)
        if estado is not None:
            estados_validos = {"ACTIVO", "EN_DESCANSO", "FINALIZADO"}
            if estado not in estados_validos:
                raise AppException(f"Estado invalido.", 400)

        return LoteRepository.update(
            lote,
            nombre=nombre,
            hectareas=hectareas,
            estado=estado,
            cultivo_id=cultivo_id,
        )

    @staticmethod
    def delete(lote_id: int) -> None:
        """Delete a plot record or raise not-found."""
        lote = LoteService.get_by_id(lote_id)
        LoteRepository.delete(lote)
