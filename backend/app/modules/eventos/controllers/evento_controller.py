"""HTTP routes for event record management."""

from flask import Blueprint, jsonify, request

from app.modules.eventos.dtos.evento_dtos import (
    evento_create_schema,
    evento_schema,
    eventos_schema,
)
from app.modules.eventos.services.evento_service import EventoService
from app.shared.utils.app_exception import AppException
from marshmallow import ValidationError

eventos_bp = Blueprint("eventos", __name__, url_prefix="/api/eventos")


@eventos_bp.route("", methods=["GET"])
def list_eventos():
    """Return all event records."""
    eventos = EventoService.list_all()
    return jsonify(eventos_schema.dump(eventos)), 200


@eventos_bp.route("/<int:evento_id>", methods=["GET"])
def get_evento(evento_id: int):
    """Return a single event record by id."""
    try:
        evento = EventoService.get_by_id(evento_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(evento_schema.dump(evento)), 200


@eventos_bp.route("", methods=["POST"])
def create_evento():
    """Create a new event record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = evento_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        evento = EventoService.create(
            finca_id=data["finca_id"],
            fecha=data["fecha"],
            titulo=data["titulo"],
            tipo=data["tipo"],
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(evento_schema.dump(evento)), 201


@eventos_bp.route("/<int:evento_id>", methods=["PUT"])
def update_evento(evento_id: int):
    """Update an existing event record."""
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "El cuerpo debe ser un objeto JSON."}), 400
    try:
        data = evento_create_schema.load(payload)
    except ValidationError as error:
        return jsonify({"error": "Datos invalidos.", "details": error.messages}), 400
    try:
        evento = EventoService.update(
            evento_id,
            fecha=data.get("fecha"),
            titulo=data.get("titulo"),
            tipo=data.get("tipo"),
            estado=data.get("estado"),
        )
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify(evento_schema.dump(evento)), 200


@eventos_bp.route("/<int:evento_id>", methods=["DELETE"])
def delete_evento(evento_id: int):
    """Delete an event record by id."""
    try:
        EventoService.delete(evento_id)
    except AppException as error:
        return jsonify({"error": error.message}), error.status_code
    return jsonify({"message": "Evento eliminado correctamente."}), 200
