"""ORM entities for agricultural labor records."""

from datetime import datetime, date
from sqlalchemy import func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Labor(db.Model):
    """Agricultural labor record mapped to the existing ``labores`` table."""

    __tablename__ = "labores"

    id: Mapped[int] = mapped_column(primary_key=True)
    finca_id: Mapped[int] = mapped_column(ForeignKey("fincas.id", ondelete="RESTRICT"), nullable=False)
    lote_id: Mapped[int] = mapped_column(ForeignKey("lotes.id", ondelete="RESTRICT"), nullable=False)
    tipo: Mapped[str] = mapped_column(
        db.Enum("siembra", "fertilizacion", "fumigacion", "poda", "riego", "cosecha", name="labor_tipo"),
        nullable=False,
    )
    fecha: Mapped[date] = mapped_column(db.Date, nullable=False)
    estado: Mapped[str] = mapped_column(
        db.Enum("Pendiente", "Por confirmar", "Completada", "Vencida", name="labor_estado"),
        nullable=False,
        default="Pendiente",
    )
    insumo: Mapped[str | None] = mapped_column(db.String(100))
    dosis: Mapped[str | None] = mapped_column(db.String(50))
    observaciones: Mapped[str | None] = mapped_column(db.Text)
    creado_en: Mapped[datetime] = mapped_column(
        db.DateTime, nullable=False, server_default=func.current_timestamp()
    )
    actualizado_en: Mapped[datetime] = mapped_column(
        db.DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    lote = relationship("Lote", backref="labores")
    finca = relationship("Finca", backref="labores")

    def __repr__(self) -> str:
        return f"<Labor {self.tipo} {self.fecha}>"
