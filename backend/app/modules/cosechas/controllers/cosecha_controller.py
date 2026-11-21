"""HTTP routes for harvest record management."""

from flask import Blueprint, jsonify, request

from app.modules.cosechas.dtos.cosecha_dtos import (
    cosecha_create_schema,
    cosecha_schema,
    cosechas_schema,
)
from app.modules.cosechas.services.cosecha_service import CosechaService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

cosechas_bp = Blueprint("cosechas", __name__, url_prefix="/api/cosechas")


@cosechas_bp.route("", methods=["GET"])
def list_cosechas():
    """Return all harvest records."""
    cosechas = CosechaService.list_all()
    return jsonify(cosechas_schema.dump(cosechas)), 200


@cosechas_bp.route("/<int:cosecha_id>", methods=["GET"])
def get_cosecha(cosecha_id: int):
    """Return a single harvest record by id."""
    try:
        cosecha = CosechaService.get_by_id(cosecha_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(cosecha_schema.dump(cosecha)), 200


@cosechas_bp.route("", methods=["POST"])
def create_cosecha():
    """Create a new harvest record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = cosecha_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        cosecha = CosechaService.create(
            finca_id=data["finca_id"],
            lote_codigo_qr=data["lote_codigo_qr"],
            fecha=data["fecha"],
            cantidad=data["cantidad"],
            unidad=data["unidad"],
            calidad=data.get("calidad"),
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(cosecha_schema.dump(cosecha)), 201


@cosechas_bp.route("/<int:cosecha_id>", methods=["PUT"])
def update_cosecha(cosecha_id: int):
    """Update an existing harvest record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = cosecha_create_schema.load(payload, partial=True)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    if not data:
        return jsonify({"error": "Debe enviar al menos un campo para actualizar."}), 400
    try:
        cosecha = CosechaService.update(
            cosecha_id,
            lote_codigo_qr=data.get("lote_codigo_qr"),
            fecha=data.get("fecha"),
            cantidad=data.get("cantidad"),
            unidad=data.get("unidad"),
            calidad=data.get("calidad"),
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(cosecha_schema.dump(cosecha)), 200


@cosechas_bp.route("/<int:cosecha_id>", methods=["DELETE"])
def delete_cosecha(cosecha_id: int):
    """Delete a harvest record by id."""
    try:
        CosechaService.delete(cosecha_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Cosecha eliminada correctamente."}), 200
