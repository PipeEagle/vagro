"""Schemas for input supply record requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class InsumoSchema(ma.Schema):
    """Serialize/deserialize a full input supply record."""

    class Meta:
        fields = (
            "id", "finca_id", "nombre", "tipo", "ingrediente",
            "carencia", "cantidad", "unidad", "creado_en", "actualizado_en",
        )

    id = fields.Integer(dump_only=True)
    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    tipo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    ingrediente = fields.String(allow_none=True)
    carencia = fields.String(allow_none=True)
    cantidad = fields.Float(allow_none=True)
    unidad = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=20), validate_not_blank],
    )
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class InsumoCreateSchema(ma.Schema):
    """Validate payload for creating an input supply record."""

    finca_id = fields.Integer(required=True, validate=validate.Range(min=1))
    nombre = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    tipo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    ingrediente = fields.String(allow_none=True)
    carencia = fields.String(allow_none=True)
    cantidad = fields.Decimal(
        required=True,
        places=2,
        validate=validate.Range(min=0),
    )
    unidad = fields.String(
        validate=[validate.Length(min=1, max=20), validate_not_blank],
        allow_none=True,
    )


insumo_schema = InsumoSchema()
insumos_schema = InsumoSchema(many=True)
insumo_create_schema = InsumoCreateSchema()
