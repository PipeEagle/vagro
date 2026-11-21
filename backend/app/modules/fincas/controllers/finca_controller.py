"""HTTP routes for farm record management."""

from flask import Blueprint, jsonify, request

from app.modules.fincas.dtos.finca_dtos import (
    finca_create_schema,
    finca_schema,
    fincas_schema,
)
from app.modules.fincas.services.finca_service import FincaService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

fincas_bp = Blueprint("fincas", __name__, url_prefix="/api/fincas")


@fincas_bp.route("", methods=["GET"])
def list_fincas():
    """Return all farm records."""
    fincas = FincaService.list_all()
    return jsonify(fincas_schema.dump(fincas)), 200


@fincas_bp.route("/<int:finca_id>", methods=["GET"])
def get_finca(finca_id: int):
    """Return a single farm record by id."""
    try:
        finca = FincaService.get_by_id(finca_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(finca_schema.dump(finca)), 200


@fincas_bp.route("", methods=["POST"])
def create_finca():
    """Create a new farm record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = finca_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        finca = FincaService.create(
            nombre=data["nombre"],
            municipio=data["municipio"],
            departamento=data["departamento"],
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(finca_schema.dump(finca)), 201


@fincas_bp.route("/<int:finca_id>", methods=["PUT"])
def update_finca(finca_id: int):
    """Update an existing farm record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = finca_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        finca = FincaService.update(
            finca_id,
            nombre=data.get("nombre"),
            municipio=data.get("municipio"),
            departamento=data.get("departamento"),
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(finca_schema.dump(finca)), 200


@fincas_bp.route("/<int:finca_id>", methods=["DELETE"])
def delete_finca(finca_id: int):
    """Delete a farm record by id."""
    try:
        FincaService.delete(finca_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Finca eliminada correctamente."}), 200
