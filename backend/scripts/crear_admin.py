"""Script manual para crear el primer administrador en AgroGestion.

Genera un hash BCrypt de la contraseña en tiempo de ejecución y crea
el usuario administrador en la tabla usuarios si no existe.
"""

from app import create_app
from app.extensions import db, bcrypt
from app.modules.usuarios.entities.models import Usuario


def crear_admin(username: str = "admin",
                password: str = "Admin123!",
                nombre_completo: str = "Administrador Principal",
                rol: str = "SUPERADMIN") -> None:
    """Crea el primer administrador si no existe."""
    app = create_app()
    with app.app_context():
        password_hash = bcrypt.generate_password_hash(password.encode("utf-8")).decode("utf-8")

        existing = Usuario.query.filter_by(username=username).first()
        if existing:
            print(f"El usuario '{username}' ya existe.")
            return

        admin = Usuario(
            username=username,
            password_hash=password_hash,
            nombre_completo=nombre_completo,
            rol=rol,
            is_active=True,
        )
        db.session.add(admin)
        db.session.commit()
        print(f"Administrador '{username}' creado exitosamente.")


if __name__ == "__main__":
    crear_admin()
