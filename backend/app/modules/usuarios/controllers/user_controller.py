"""HTTP routes for user account management."""

from flask import Blueprint, jsonify, request

from app.modules.usuarios.controllers.auth_controller import admin_required
from app.modules.usuarios.dtos.user_dtos import (
    user_create_schema,
    user_schema,
    usuarios_schema,
)
from app.modules.usuarios.services.user_service import UserService
from app.shared.utils.app_exception import AppException
from flask_login import login_required
from marshmallow import ValidationError

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")


@usuarios_bp.route("", methods=["GET"])
@login_required
@admin_required
def list_usuarios():
    """Return all user accounts."""
    usuarios = UserService.list_all()
    return jsonify(usuarios_schema.dump(usuarios)), 200


@usuarios_bp.route("/<int:user_id>", methods=["GET"])
@login_required
@admin_required
def get_usuario(user_id: int):
    """Return a single user account by id."""
    try:
        usuario = UserService.get_by_id(user_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(user_schema.dump(usuario)), 200


@usuarios_bp.route("", methods=["POST"])
@login_required
@admin_required
def create_usuario():
    """Create a new user account."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = user_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        usuario = UserService.create(
            username=data["username"],
            password=data["password"],
            nombre_completo=data["nombre_completo"],
            rol=data["rol"],
            finca_id=data.get("finca_id"),
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(user_schema.dump(usuario)), 201


@usuarios_bp.route("/<int:user_id>", methods=["PUT"])
@login_required
@admin_required
def update_usuario(user_id: int):
    """Update an existing user account."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = user_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        usuario = UserService.update(
            user_id,
            nombre_completo=data.get("nombre_completo"),
            rol=data.get("rol"),
            finca_id=data.get("finca_id"),
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(user_schema.dump(usuario)), 200


@usuarios_bp.route("/<int:user_id>", methods=["DELETE"])
@login_required
@admin_required
def delete_usuario(user_id: int):
    """Delete a user account by id."""
    try:
        UserService.delete(user_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Usuario eliminado correctamente."}), 200
