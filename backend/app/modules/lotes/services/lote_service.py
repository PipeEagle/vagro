"""Business logic for public plot lookups."""

from typing import Any

from app.modules.lotes.dtos.lote_dtos import lote_public_schema
from app.modules.lotes.repositories.lote_repository import LoteRepository
from app.shared.utils.app_exception import AppException


class LoteService:
    """Resolve and serialize plots requested by public QR code."""

    @staticmethod
    def get_lote_details_by_qr(codigo_qr: str) -> dict[str, Any]:
        """Return public plot details only when the plot is active."""
        lote = LoteRepository.get_by_qr_code(codigo_qr)
        if lote is None or lote.estado != "ACTIVO":
            raise AppException("No se encontro un lote activo para ese codigo QR.", 404)
        return lote_public_schema.dump(lote)
