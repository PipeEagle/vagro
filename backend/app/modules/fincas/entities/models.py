"""ORM entities for farm records."""

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Finca(db.Model):
    """Farm record mapped to the existing ``fincas`` table."""

    __tablename__ = "fincas"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(db.String(150), nullable=False)
    municipio: Mapped[str] = mapped_column(db.String(100), nullable=False)
    departamento: Mapped[str] = mapped_column(db.String(100), nullable=False)
    estado: Mapped[str] = mapped_column(
        db.Enum("ACTIVO", "EN_DESCANSO", "FINALIZADO", name="finca_estado"),
        nullable=False,
        default="ACTIVO",
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
        return f"<Finca {self.nombre}>"
