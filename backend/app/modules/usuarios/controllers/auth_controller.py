"""HTTP routes for administrator authentication."""

from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar

from flask import (
    Blueprint,
    Response,
    abort,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from flask_login import current_user, login_required, login_user, logout_user
from marshmallow import ValidationError

from app.modules.usuarios.dtos.auth_dtos import login_schema
from app.modules.usuarios.services.auth_service import AuthService
from app.shared.utils.app_exception import AppException

P = ParamSpec("P")
R = TypeVar("R")

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
auth_pages_bp = Blueprint("auth_pages", __name__)


def admin_required(
    view: Callable[P, R],
) -> Callable[P, R | tuple[Response, int]]:
    """Require a logged-in administrator for a controller route."""

    @wraps(view)
    def wrapped(*args: P.args, **kwargs: P.kwargs) -> R | tuple[Response, int]:
        if not current_user.is_authenticated:
            return jsonify({"error": "Se requiere iniciar sesion."}), 401
        if current_user.rol not in {"ADMIN", "SUPERADMIN"}:
            return jsonify({"error": "Se requiere el rol de administrador."}), 403
        return view(*args, **kwargs)

    return wrapped


@auth_pages_bp.route("/login", methods=["GET", "POST"])
def login_form() -> str | tuple[str, int] | Response:
    """Render the sign-in form and authenticate submitted browser credentials."""
    if request.method == "GET":
        return render_template("admin/login.html")

    username = request.form.get("username", "")
    try:
        credentials = login_schema.load(
            {
                "username": username,
                "password": request.form.get("password", ""),
            }
        )
    except ValidationError:
        return (
            render_template(
                "admin/login.html",
                error="Ingresa un usuario y una contrasena validos.",
                username=username,
            ),
            400,
        )

    try:
        user = AuthService.authenticate(
            username=credentials["username"],
            password=credentials["password"],
        )
    except AppException as error:
        return (
            render_template(
                "admin/login.html",
                error=error.message,
                username=username,
            ),
            error.status_code,
        )

    login_user(user)
    current_app.logger.info("Administrator %s signed in through the web form.", user.username)
    return redirect(url_for("auth_pages.admin_dashboard"))


@auth_pages_bp.get("/admin/dashboard")
@login_required
def admin_dashboard() -> str:
    """Render the administrator dashboard for authenticated administrators."""
    if current_user.rol not in {"ADMIN", "SUPERADMIN"}:
        abort(403)
    return render_template("admin/dashboard.html")


@auth_bp.post("/login")
def login() -> tuple[Response, int] | Response:
    """Validate credentials and create an authenticated session."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        credentials = login_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos de acceso invalidos.", "details": error.messages}), 400

    user = AuthService.authenticate(
        username=credentials["username"],
        password=credentials["password"],
    )
    login_user(user)
    current_app.logger.info("Administrator %s signed in.", user.username)
    return jsonify(
        {
            "message": "Inicio de sesion exitoso.",
            "user": {
                "username": user.username,
                "nombre_completo": user.nombre_completo,
                "rol": user.rol,
            },
        }
    )


@auth_bp.post("/logout")
def logout() -> tuple[Response, int] | Response:
    """End the current administrator session."""
    if not current_user.is_authenticated:
        return jsonify({"error": "No hay una sesion activa."}), 401
    logout_user()
    return jsonify({"message": "Sesion cerrada."})


@auth_bp.get("/me")
def me() -> tuple[Response, int] | Response:
    """Return the current authenticated user, if any."""
    if not current_user.is_authenticated:
        return jsonify({"error": "No hay una sesion activa."}), 401
    return jsonify(
        {
            "user": {
                "username": current_user.username,
                "nombre_completo": current_user.nombre_completo,
                "rol": current_user.rol,
            }
        }
    )
