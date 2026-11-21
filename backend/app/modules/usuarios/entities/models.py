"""ORM entities for administrator accounts."""

from datetime import datetime

from flask_login import UserMixin
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Usuario(UserMixin, db.Model):
    """Administrator account mapped to the existing ``usuarios`` table."""

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(db.String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.String(255), nullable=False)
    nombre_completo: Mapped[str] = mapped_column(db.String(100), nullable=False)
    finca_id: Mapped[int | None] = mapped_column(
        ForeignKey("fincas.id", ondelete="SET NULL"), nullable=True
    )
    rol: Mapped[str] = mapped_column(
        db.Enum("ADMIN", "SUPERADMIN", "MAYORDOMO", name="usuario_rol"),
        nullable=False,
        default="ADMIN",
    )
    is_active: Mapped[bool] = mapped_column(db.Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime, nullable=False, server_default=func.current_timestamp()
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    def get_id(self) -> str:
        """Return the primary key in the format expected by Flask-Login."""
        return str(self.id)

    @property
    def estado(self) -> str:
        """Return the account status expected by the user API."""
        return "Activo" if self.is_active else "Inactivo"

    @estado.setter
    def estado(self, value: str) -> None:
        """Keep API status updates aligned with Flask-Login activation."""
        self.is_active = value == "Activo"
