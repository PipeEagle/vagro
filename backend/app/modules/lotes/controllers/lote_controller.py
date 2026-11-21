"""HTTP routes for plot management."""

from flask import Blueprint, jsonify, request

from app.modules.lotes.dtos.lote_dtos import (
    lote_create_schema,
    lote_public_schema,
    lote_schema,
    lotes_schema,
)
from app.modules.lotes.services.lote_service import LoteService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

lotes_bp = Blueprint("lotes", __name__, url_prefix="/api/lotes")


@lotes_bp.get("/qr/<string:codigo_qr>")
def get_lote_by_qr(codigo_qr: str):
    """Return public plot details for a QR code without authentication."""
    lote = LoteService.get_by_qr_code(codigo_qr)
    return jsonify({"data": lote})


@lotes_bp.get("/qr/<string:codigo_qr>/image")
def get_lote_qr_image(codigo_qr: str):
    """Return PNG QR code image for a lote."""
    lote = LoteService.get_by_qr_code(codigo_qr)
    qr_base64 = lote  # placeholder; actual image generation uses qr_generator
    import base64
    from app.shared.utils.qr_generator import generate_qr_base64
    qr_b64 = generate_qr_base64(codigo_qr)
    return base64.b64decode(qr_b64), 200, {"Content-Type": "image/png"}


@lotes_bp.route("", methods=["GET"])
def list_lotes():
    """Return all plot records."""
    lotes = LoteService.list_all()
    return jsonify(lotes_schema.dump(lotes)), 200


@lotes_bp.route("/<int:lote_id>", methods=["GET"])
def get_lote(lote_id: int):
    """Return a single plot record by id."""
    try:
        lote = LoteService.get_by_id(lote_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(lote_schema.dump(lote)), 200


@lotes_bp.route("", methods=["POST"])
def create_lote():
    """Create a new plot record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = lote_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        lote = LoteService.create(
            finca_id=data["finca_id"],
            cultivo_id=data["cultivo_id"],
            codigo_qr=data["codigo_qr"],
            nombre=data["nombre"],
            hectareas=data["hectareas"],
            estado=data.get("estado"),
            fecha_siembra=data.get("fecha_siembra"),
            estado_fenologico=data.get("estado_fenologico"),
            arboles=data.get("arboles"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(lote_schema.dump(lote)), 201


@lotes_bp.route("/<int:lote_id>", methods=["PUT"])
def update_lote(lote_id: int):
    """Update an existing plot record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = lote_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        lote = LoteService.update(
            lote_id,
            nombre=data.get("nombre"),
            hectareas=data.get("hectareas"),
            estado=data.get("estado"),
            cultivo_id=data.get("cultivo_id"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(lote_schema.dump(lote)), 200


@lotes_bp.route("/<int:lote_id>", methods=["DELETE"])
def delete_lote(lote_id: int):
    """Delete a plot record by id."""
    try:
        LoteService.delete(lote_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Lote eliminado correctamente."}), 200
