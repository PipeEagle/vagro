"""HTTP routes for crop catalog management."""

from flask import Blueprint, jsonify, request

from app.modules.cultivos.dtos.cultivo_dtos import (
    cultivo_create_schema,
    cultivo_schema,
    cultivos_schema,
)
from app.modules.cultivos.services.cultivo_service import CultivoService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

cultivos_bp = Blueprint("cultivos", __name__, url_prefix="/api/cultivos")


@cultivos_bp.route("", methods=["GET"])
def list_cultivos():
    """Return all crop entries."""
    cultivos = CultivoService.list_all()
    return jsonify(cultivos_schema.dump(cultivos)), 200


@cultivos_bp.route("/<int:cultivo_id>", methods=["GET"])
def get_cultivo(cultivo_id: int):
    """Return a single crop entry by id."""
    try:
        cultivo = CultivoService.get_by_id(cultivo_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(cultivo_schema.dump(cultivo)), 200


@cultivos_bp.route("", methods=["POST"])
def create_cultivo():
    """Create a new crop entry."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = cultivo_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        cultivo = CultivoService.create(
            nombre=data.get("nombre"),
            descripcion=data.get("descripcion"),
            ciclo_estimado_dias=data.get("ciclo_estimado_dias"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(cultivo_schema.dump(cultivo)), 201


@cultivos_bp.route("/<int:cultivo_id>", methods=["PUT"])
def update_cultivo(cultivo_id: int):
    """Update an existing crop entry."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = cultivo_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        cultivo = CultivoService.update(
            cultivo_id,
            nombre=data.get("nombre"),
            descripcion=data.get("descripcion"),
            ciclo_estimado_dias=data.get("ciclo_estimado_dias"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(cultivo_schema.dump(cultivo)), 200


@cultivos_bp.route("/<int:cultivo_id>", methods=["DELETE"])
def delete_cultivo(cultivo_id: int):
    """Delete a crop entry by id."""
    try:
        CultivoService.delete(cultivo_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Cultivo eliminado correctamente."}), 200
