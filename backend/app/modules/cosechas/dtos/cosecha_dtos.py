"""Schemas for harvest record requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class CosechaSchema(ma.Schema):
    """Serialize/deserialize a full harvest record."""

    class Meta:
        fields = (
            "id", "finca_id", "lote_codigo_qr", "fecha", "cantidad",
            "unidad", "calidad", "estado", "creado_en", "actualizado_en",
        )

    id = fields.Integer(dump_only=True)
    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    lote_codigo_qr = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    fecha = fields.Date(required=True)
    cantidad = fields.Float(required=True, validate=validate.Range(min=0))
    unidad = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    calidad = fields.String(
        required=True,
        validate=validate.OneOf(["Primera", "Segunda", "Rechazo"]),
    )
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["Pendiente", "Por confirmar", "Completada"]),
    )
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class CosechaCreateSchema(ma.Schema):
    """Validate payload for creating a harvest record."""

    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    lote_codigo_qr = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    fecha = fields.Date(required=True)
    cantidad = fields.Float(required=True, validate=validate.Range(min=0))
    unidad = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    calidad = fields.String(
        validate=validate.OneOf(["Primera", "Segunda", "Rechazo"]),
        allow_none=True,
    )
    estado = fields.String(
        validate=validate.OneOf(["Pendiente", "Por confirmar", "Completada"]),
        allow_none=True,
    )


cosecha_schema = CosechaSchema()
cosechas_schema = CosechaSchema(many=True)
cosecha_create_schema = CosechaCreateSchema()
