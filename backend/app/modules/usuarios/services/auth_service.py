"""Authentication business logic."""

from app.extensions import bcrypt
from app.modules.usuarios.entities.models import Usuario
from app.modules.usuarios.repositories.user_repository import UserRepository
from app.shared.utils.app_exception import AppException


class AuthService:
    """Authenticate administrators without depending on HTTP request objects."""

    @staticmethod
    def authenticate(username: str, password: str) -> Usuario:
        """Return an active account or raise an authentication error."""
        user = UserRepository.get_by_username(username)
        if (
            user is None
            or not user.is_active
            or not bcrypt.check_password_hash(user.password_hash, password)
        ):
            raise AppException("Usuario o contrasena incorrectos.", 401)
        return user


def load_user(user_id: str) -> Usuario | None:
    """Load a Flask-Login account from its session identifier."""
    if not user_id.isdecimal():
        return None
    user = UserRepository.get_by_id(int(user_id))
    return user if user is not None and user.is_active else None
