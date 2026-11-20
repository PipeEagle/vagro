"""ORM entities for crop catalog."""

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Cultivo(db.Model):
    """Crop catalog entry mapped to the existing ``cultivos`` table."""

    __tablename__ = "cultivos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(db.String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(db.Text)
    ciclo_estimado_dias: Mapped[int | None] = mapped_column(db.Integer)
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
        return f"<Cultivo {self.nombre}>"
