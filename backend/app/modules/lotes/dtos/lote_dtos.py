"""Schemas for plot requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class CultivoPublicSchema(ma.Schema):
    """Expose the public name of a crop type."""

    nombre = fields.String(dump_only=True)


class LotePublicSchema(ma.Schema):
    """Expose only non-sensitive plot and crop information."""

    nombre = fields.String(dump_only=True)
    estado = fields.String(dump_only=True)
    cultivo = fields.Nested(CultivoPublicSchema, dump_only=True)
    hectareas = fields.Float(dump_only=True)


class LoteSchema(ma.Schema):
    """Serialize/deserialize a full plot record."""

    class Meta:
        fields = (
            "id", "finca_id", "cultivo_id", "cultivo", "codigo_qr", "nombre",
            "hectareas", "estado", "fecha_siembra", "estado_fenologico",
            "arboles", "creado_en", "actualizado_en",
        )

    id = fields.Integer(dump_only=True)
    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    cultivo_id = fields.Integer(required=True, validate=validate.Range(min=1))
    cultivo = fields.Nested(CultivoPublicSchema, dump_only=True)
    codigo_qr = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    hectareas = fields.Float(required=True, validate=validate.Range(min=0))
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["ACTIVO", "EN_DESCANSO", "FINALIZADO"]),
    )
    fecha_siembra = fields.Date(allow_none=True)
    estado_fenologico = fields.String(allow_none=True)
    arboles = fields.Integer(allow_none=True)
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class LoteCreateSchema(ma.Schema):
    """Validate payload for creating a plot record."""

    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    cultivo_id = fields.Integer(required=True, validate=validate.Range(min=1))
    codigo_qr = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    hectareas = fields.Float(required=True, validate=validate.Range(min=0))
    estado = fields.String(
        validate=validate.OneOf(["ACTIVO", "EN_DESCANSO", "FINALIZADO"]),
        allow_none=True,
    )
    fecha_siembra = fields.Date(allow_none=True)
    estado_fenologico = fields.String(allow_none=True)
    arboles = fields.Integer(allow_none=True)


lote_public_schema = LotePublicSchema()
lote_schema = LoteSchema()
lotes_schema = LoteSchema(many=True)
lote_create_schema = LoteCreateSchema()
