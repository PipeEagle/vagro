"""Business logic for harvest records."""

from datetime import date

from app.modules.cosechas.dtos.cosecha_dtos import cosecha_create_schema
from app.modules.cosechas.entities.models import Cosecha
from app.modules.cosechas.repositories.cosecha_repository import CosechaRepository
from app.modules.fincas.repositories.finca_repository import FincaRepository
from app.modules.lotes.repositories.lote_repository import LoteRepository
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError


class CosechaService:
    """Business rules and validations for harvest records."""

    @staticmethod
    def list_all() -> list[Cosecha]:
        """Return all harvest records."""
        return CosechaRepository.get_all()

    @staticmethod
    def get_by_id(cosecha_id: int) -> Cosecha:
        """Return a harvest record by id or raise a not-found error."""
        cosecha = CosechaRepository.get_by_id(cosecha_id)
        if cosecha is None:
            raise AppException("Cosecha no encontrada.", 404)
        return cosecha

    @staticmethod
    def get_by_finca(finca_id: int) -> list[Cosecha]:
        """Return harvest records for a given finca."""
        return CosechaRepository.get_by_finca(finca_id)

    @staticmethod
    def create(
        finca_id: int,
        lote_codigo_qr: str,
        fecha: date,
        cantidad: float,
        unidad: str,
        calidad: str | None = None,
        estado: str | None = None,
    ) -> Cosecha:
        """Validate and create a new harvest record."""
        if calidad is None:
            calidad = "Primera"
        if estado is None:
            estado = "Pendiente"

        if FincaRepository.get_by_id(finca_id) is None:
            raise AppException("La finca seleccionada no existe.", 400)
        lote = LoteRepository.get_by_qr_code(lote_codigo_qr)
        if lote is None:
            raise AppException("El lote seleccionado no existe.", 400)
        if lote.finca_id != finca_id:
            raise AppException("El lote no pertenece a la finca seleccionada.", 400)

        calidades_validas = {"Primera", "Segunda", "Rechazo"}
        if calidad not in calidades_validas:
            raise AppException(f"Calidad invalida. Validas: {', '.join(sorted(calidades_validas))}.", 400)

        estados_validos = {"Pendiente", "Por confirmar", "Completada"}
        if estado not in estados_validos:
            raise AppException(f"Estado invalido. Validos: {', '.join(sorted(estados_validos))}.", 400)
        if fecha < date.today():
            estado = "Completada"
        elif fecha > date.today() and estado == "Completada":
            raise AppException(
                "Una cosecha futura no puede marcarse como Completada antes de su fecha.",
                400,
            )

        return CosechaRepository.create(
            finca_id=finca_id,
            lote_codigo_qr=lote_codigo_qr,
            fecha=fecha,
            cantidad=cantidad,
            unidad=unidad,
            calidad=calidad,
            estado=estado,
        )

    @staticmethod
    def update(
        cosecha_id: int,
        lote_codigo_qr: str | None = None,
        fecha: date | None = None,
        cantidad: float | None = None,
        unidad: str | None = None,
        calidad: str | None = None,
        estado: str | None = None,
    ) -> Cosecha:
        """Validate and update an existing harvest record."""
        cosecha = CosechaService.get_by_id(cosecha_id)

        if calidad is not None:
            calidades_validas = {"Primera", "Segunda", "Rechazo"}
            if calidad not in calidades_validas:
                raise AppException(f"Calidad invalida.", 400)

        if estado is not None:
            estados_validos = {"Pendiente", "Por confirmar", "Completada"}
            if estado not in estados_validos:
                raise AppException(f"Estado invalido.", 400)
        fecha_cosecha = fecha or cosecha.fecha
        if fecha_cosecha < date.today():
            estado = "Completada"
        elif (
            fecha_cosecha > date.today()
            and (estado or cosecha.estado) == "Completada"
        ):
            raise AppException(
                "Una cosecha futura no puede marcarse como Completada antes de su fecha.",
                400,
            )

        return CosechaRepository.update(
            cosecha,
            lote_codigo_qr=lote_codigo_qr,
            fecha=fecha,
            cantidad=cantidad,
            unidad=unidad,
            calidad=calidad,
            estado=estado,
        )

    @staticmethod
    def delete(cosecha_id: int) -> None:
        """Delete a harvest record or raise not-found."""
        cosecha = CosechaService.get_by_id(cosecha_id)
        CosechaRepository.delete(cosecha)
