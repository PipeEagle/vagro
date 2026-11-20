"""Database access for agricultural plots."""

from sqlalchemy import select

from app.extensions import db
from app.modules.lotes.entities.models import Lote


class LoteRepository:
    """Read plot records required by public QR lookups."""

    @staticmethod
    def get_by_qr_code(codigo_qr: str) -> Lote | None:
        """Return the plot associated with a QR code, if it exists."""
        statement = select(Lote).where(Lote.codigo_qr == codigo_qr)
        return db.session.scalar(statement)
