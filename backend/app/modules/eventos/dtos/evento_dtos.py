"""Schemas for event record requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class EventoSchema(ma.Schema):
    """Serialize/deserialize a full event record."""

    class Meta:
        fields = (
            "id", "finca_id", "fecha", "titulo", "tipo", "estado",
            "creado_en", "actualizado_en",
        )

    id = fields.Integer(dump_only=True)
    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    fecha = fields.Date(required=True)
    titulo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=200), validate_not_blank],
    )
    tipo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["Pendiente", "Completada", "Vencida"]),
    )
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class EventoCreateSchema(ma.Schema):
    """Validate payload for creating an event record."""

    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    fecha = fields.Date(required=True)
    titulo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=200), validate_not_blank],
    )
    tipo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    estado = fields.String(
        validate=validate.OneOf(["Pendiente", "Completada", "Vencida"]),
        allow_none=True,
    )


evento_schema = EventoSchema()
eventos_schema = EventoSchema(many=True)
evento_create_schema = EventoCreateSchema()
