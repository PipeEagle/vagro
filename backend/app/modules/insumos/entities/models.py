"""ORM entities for input supply records."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Insumo(db.Model):
    """Input supply record mapped to the existing ``insumos`` table."""

    __tablename__ = "insumos"

    id: Mapped[int] = mapped_column(primary_key=True)
    finca_id: Mapped[int] = mapped_column(nullable=False)
    nombre: Mapped[str] = mapped_column(db.String(150), nullable=False)
    tipo: Mapped[str] = mapped_column(db.String(50), nullable=False)
    ingrediente: Mapped[str | None] = mapped_column(db.String(200), nullable=True)
    carencia: Mapped[str | None] = mapped_column(db.String(50), nullable=True)
    cantidad: Mapped[Decimal | None] = mapped_column(db.Numeric(10, 2), nullable=True)
    unidad: Mapped[str] = mapped_column(db.String(20), nullable=False)
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
        return f"<Insumo {self.nombre}>"
