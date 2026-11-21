"""ORM entities for harvest records."""

from datetime import date, datetime

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Cosecha(db.Model):
    """Harvest record mapped to the existing ``cosechas`` table."""

    __tablename__ = "cosechas"

    id: Mapped[int] = mapped_column(primary_key=True)
    finca_id: Mapped[int] = mapped_column(nullable=False)
    lote_codigo_qr: Mapped[str] = mapped_column(db.String(50), nullable=False)
    fecha: Mapped[date] = mapped_column(db.Date, nullable=False)
    cantidad: Mapped[float] = mapped_column(db.Numeric(10, 2), nullable=False)
    unidad: Mapped[str] = mapped_column(db.String(50), nullable=False)
    calidad: Mapped[str] = mapped_column(
        db.Enum("Primera", "Segunda", "Rechazo", name="cosecha_calidad"),
        nullable=False,
        default="Primera",
    )
    estado: Mapped[str] = mapped_column(
        db.Enum("Pendiente", "Por confirmar", "Completada", name="cosecha_estado"),
        nullable=False,
        default="Pendiente",
    )
    creado_en: Mapped[datetime] = mapped_column(
        db.DateTime, nullable=False, server_default=func.current_timestamp()
    )
    actualizado_en: Mapped[datetime] = mapped_column(
        db.DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    def __repr__(self) -> str:
        return f"<Cosecha {self.id} {self.lote_codigo_qr}>"
