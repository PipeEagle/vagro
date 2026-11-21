"""Schemas for crop catalog requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class CultivoSchema(ma.Schema):
    """Serialize/deserialize a full crop entry."""

    class Meta:
        fields = ("id", "nombre", "descripcion", "ciclo_estimado_dias", "creado_en", "actualizado_en")

    id = fields.Integer(dump_only=True)
    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=100), validate_not_blank],
    )
    descripcion = fields.String(allow_none=True)
    ciclo_estimado_dias = fields.Integer(allow_none=True)
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class CultivoCreateSchema(ma.Schema):
    """Validate payload for creating a crop entry."""

    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=100), validate_not_blank],
    )
    descripcion = fields.String(allow_none=True)
    ciclo_estimado_dias = fields.Integer(allow_none=True)


cultivo_schema = CultivoSchema()
cultivos_schema = CultivoSchema(many=True)
cultivo_create_schema = CultivoCreateSchema()
