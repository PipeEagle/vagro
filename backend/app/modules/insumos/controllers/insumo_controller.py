"""HTTP routes for input supply record management."""

from flask import Blueprint, jsonify, request

from app.modules.insumos.dtos.insumo_dtos import (
    insumo_create_schema,
    insumo_schema,
    insumos_schema,
)
from app.modules.insumos.services.insumo_service import InsumoService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

insumos_bp = Blueprint("insumos", __name__, url_prefix="/api/insumos")


@insumos_bp.route("", methods=["GET"])
def list_insumos():
    """Return all input supply records."""
    insumos = InsumoService.list_all()
    return jsonify(insumos_schema.dump(insumos)), 200


@insumos_bp.route("/<int:insumo_id>", methods=["GET"])
def get_insumo(insumo_id: int):
    """Return a single input supply record by id."""
    try:
        insumo = InsumoService.get_by_id(insumo_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(insumo_schema.dump(insumo)), 200


@insumos_bp.route("", methods=["POST"])
def create_insumo():
    """Create a new input supply record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = insumo_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        insumo = InsumoService.create(
            finca_id=data["finca_id"],
            nombre=data["nombre"],
            tipo=data["tipo"],
            ingrediente=data.get("ingrediente"),
            carencia=data.get("carencia"),
            cantidad=data.get("cantidad"),
            unidad=data.get("unidad"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(insumo_schema.dump(insumo)), 201


@insumos_bp.route("/<int:insumo_id>", methods=["PUT"])
def update_insumo(insumo_id: int):
    """Update an existing input supply record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = insumo_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        insumo = InsumoService.update(
            insumo_id,
            nombre=data.get("nombre"),
            tipo=data.get("tipo"),
            ingrediente=data.get("ingrediente"),
            carencia=data.get("carencia"),
            cantidad=data.get("cantidad"),
            unidad=data.get("unidad"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(insumo_schema.dump(insumo)), 200


@insumos_bp.route("/<int:insumo_id>", methods=["DELETE"])
def delete_insumo(insumo_id: int):
    """Delete an input supply record by id."""
    try:
        InsumoService.delete(insumo_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Insumo eliminado correctamente."}), 200
