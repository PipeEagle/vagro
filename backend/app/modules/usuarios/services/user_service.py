"""Business logic for user accounts."""

from app.extensions import bcrypt
from app.modules.usuarios.dtos.user_dtos import user_create_schema
from app.modules.usuarios.entities.models import Usuario
from app.modules.usuarios.repositories.user_repository import UserRepository
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError


class UserService:
    """Business rules and validations for user accounts."""

    @staticmethod
    def list_all() -> list[Usuario]:
        """Return all user accounts."""
        return UserRepository.get_all()

    @staticmethod
    def get_by_id(user_id: int) -> Usuario:
        """Return a user by id or raise a not-found error."""
        user = UserRepository.get_by_id(user_id)
        if user is None:
            raise AppException("Usuario no encontrado.", 404)
        return user

    @staticmethod
    def get_by_username(username: str) -> Usuario | None:
        """Return a user by username, if it exists."""
        return UserRepository.get_by_username(username)

    @staticmethod
    def create(
        username: str,
        password: str,
        nombre_completo: str,
        rol: str,
        finca_id: int | None = None,
        estado: str | None = None,
    ) -> Usuario:
        """Validate and create a new user account."""
        if UserRepository.get_by_username(username):
            raise AppException("El usuario ya existe.", 400)

        if estado is None:
            estado = "Activo"

        estados_validos = {"Activo", "Inactivo"}
        if estado not in estados_validos:
            raise AppException(f"Estado invalido. Validos: {', '.join(sorted(estados_validos))}.", 400)

        roles_validos = {"SUPERADMIN", "ADMIN", "MAYORDOMO"}
        if rol not in roles_validos:
            raise AppException(f"Rol invalido. Validos: {', '.join(sorted(roles_validos))}.", 400)

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        return UserRepository.create(
            username=username,
            password_hash=password_hash,
            nombre_completo=nombre_completo,
            rol=rol,
            finca_id=finca_id,
            estado=estado,
        )

    @staticmethod
    def update(
        user_id: int,
        nombre_completo: str | None = None,
        rol: str | None = None,
        finca_id: int | None = None,
        estado: str | None = None,
    ) -> Usuario:
        """Validate and update an existing user account."""
        user = UserService.get_by_id(user_id)

        if rol is not None:
            roles_validos = {"SUPERADMIN", "ADMIN", "MAYORDOMO"}
            if rol not in roles_validos:
                raise AppException(f"Rol invalido.", 400)

        if estado is not None:
            estados_validos = {"Activo", "Inactivo"}
            if estado not in estados_validos:
                raise AppException(f"Estado invalido.", 400)

        return UserRepository.update(
            user,
            nombre_completo=nombre_completo,
            rol=rol,
            finca_id=finca_id,
            estado=estado,
        )

    @staticmethod
    def delete(user_id: int) -> None:
        """Delete a user account or raise not-found."""
        user = UserService.get_by_id(user_id)
        UserRepository.delete(user)
