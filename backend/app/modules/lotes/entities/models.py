"""ORM entities for agricultural plots."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Lote(db.Model):
    """Agricultural plot mapped to the existing ``lotes`` table."""

    __tablename__ = "lotes"

    id: Mapped[int] = mapped_column(primary_key=True)
    finca_id: Mapped[int] = mapped_column(
        ForeignKey("fincas.id", ondelete="RESTRICT"), nullable=False
    )
    cultivo_id: Mapped[int] = mapped_column(
        ForeignKey("cultivos.id", ondelete="RESTRICT"), nullable=False
    )
    codigo_qr: Mapped[str] = mapped_column(db.String(100), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(db.String(100), nullable=False)
    hectareas: Mapped[Decimal] = mapped_column(db.Numeric(5, 2), nullable=False)
    estado: Mapped[str] = mapped_column(
        db.Enum("ACTIVO", "EN_DESCANSO", "FINALIZADO", name="lote_estado"),
        nullable=False,
        default="ACTIVO",
    )
    fecha_siembra = mapped_column(db.Date, nullable=True)
    estado_fenologico = mapped_column(db.String(50), nullable=True)
    arboles = mapped_column(db.Integer, nullable=True)
    ubicacion_gps: Mapped[str | None] = mapped_column(db.String(100))
    creado_en: Mapped[datetime] = mapped_column(
        db.DateTime, nullable=False, server_default=func.current_timestamp()
    )
    actualizado_en: Mapped[datetime] = mapped_column(
        db.DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )
    cultivo = relationship("Cultivo", backref="lotes")
    finca = relationship("Finca", backref="lotes")

    def __repr__(self) -> str:
        return f"<Lote {self.codigo_qr}>"
