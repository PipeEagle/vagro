"""ORM entities for event records."""

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Evento(db.Model):
    """Event record mapped to the existing ``eventos`` table."""

    __tablename__ = "eventos"

    id: Mapped[int] = mapped_column(primary_key=True)
    finca_id: Mapped[int] = mapped_column(nullable=False)
    fecha: Mapped[str] = mapped_column(db.Date, nullable=False)
    titulo: Mapped[str] = mapped_column(db.String(200), nullable=False)
    tipo: Mapped[str] = mapped_column(db.String(50), nullable=False)
    estado: Mapped[str] = mapped_column(
        db.Enum("Pendiente", "Completada", "Vencida", name="evento_estado"),
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
        return f"<Evento {self.titulo}>"
