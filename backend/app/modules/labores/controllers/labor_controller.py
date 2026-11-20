"""HTTP routes for agricultural labor record management."""

from flask import Blueprint, jsonify, request

from app.modules.labores.dtos.labor_dtos import (
    labor_create_schema,
    labor_schema,
    labores_schema,
)
from app.modules.labores.services.labor_service import LaborService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

labores_bp = Blueprint("labores", __name__, url_prefix="/api/labores")


@labores_bp.route("", methods=["GET"])
def list_labores():
    """Return all labor records."""
    labores = LaborService.list_all()
    return jsonify(labores_schema.dump(labores)), 200


@labores_bp.route("/<int:labor_id>", methods=["GET"])
def get_labor(labor_id: int):
    """Return a single labor record by id."""
    try:
        labor = LaborService.get_by_id(labor_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(labor_schema.dump(labor)), 200


@labores_bp.route("", methods=["POST"])
def create_labor():
    """Create a new labor record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = labor_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        labor = LaborService.create(
            finca_id=data["finca_id"],
            lote_id=data["lote_id"],
            tipo=data["tipo"],
            fecha=data["fecha"],
            estado=data.get("estado"),
            insumo=data.get("insumo"),
            dosis=data.get("dosis"),
            observaciones=data.get("observaciones"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(labor_schema.dump(labor)), 201


@labores_bp.route("/<int:labor_id>", methods=["PUT"])
def update_labor(labor_id: int):
    """Update an existing labor record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = labor_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        labor = LaborService.update(
            labor_id,
            tipo=data.get("tipo"),
            fecha=data.get("fecha"),
            estado=data.get("estado"),
            insumo=data.get("insumo"),
            dosis=data.get("dosis"),
            observaciones=data.get("observaciones"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(labor_schema.dump(labor)), 200


@labores_bp.route("/<int:labor_id>", methods=["DELETE"])
def delete_labor(labor_id: int):
    """Delete a labor record by id."""
    try:
        LaborService.delete(labor_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Labor eliminada correctamente."}), 200
