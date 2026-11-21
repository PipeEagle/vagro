"""Schemas for farm record requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class FincaSchema(ma.Schema):
    """Serialize/deserialize a full farm record."""

    class Meta:
        fields = (
            "id", "nombre", "municipio", "departamento", "estado",
            "creado_en", "actualizado_en",
        )

    id = fields.Integer(dump_only=True)
    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    municipio = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=100), validate_not_blank],
    )
    departamento = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=100), validate_not_blank],
    )
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["ACTIVO", "EN_DESCANSO", "FINALIZADO"]),
    )
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class FincaCreateSchema(ma.Schema):
    """Validate payload for creating a farm record."""

    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    municipio = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=100), validate_not_blank],
    )
    departamento = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=100), validate_not_blank],
    )
    estado = fields.String(
        validate=validate.OneOf(["ACTIVO", "EN_DESCANSO", "FINALIZADO"]),
        allow_none=True,
    )


finca_schema = FincaSchema()
fincas_schema = FincaSchema(many=True)
finca_create_schema = FincaCreateSchema()
