"""Schemas for labor record requests and responses."""

from marshmallow import fields, validate, validates_schema, ValidationError
from marshmallow.schema import Schema

from app.extensions import ma


class LaborSchema(ma.Schema):
    """Serialize/deserialize a full labor record."""

    class Meta:
        fields = (
            "id", "finca_id", "lote_id", "tipo", "fecha",
            "estado", "insumo", "dosis", "observaciones",
            "creado_en", "actualizado_en",
        )

    id = fields.Integer(dump_only=True)
    finca_id = fields.Integer(required=True)
    lote_id = fields.Integer(required=True)
    tipo = fields.String(required=True, validate=validate.Length(min=1, max=50))
    fecha = fields.Date(required=True)
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["Programada", "Completada", "Pendiente", "Vencida"]),
    )
    insumo = fields.String(allow_none=True)
    dosis = fields.String(allow_none=True)
    observaciones = fields.String(allow_none=True)
    creado_en = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)


class LaborCreateSchema(ma.Schema):
    """Validate payload for creating a labor record."""

    finca_id = fields.Integer(required=True)
    lote_id = fields.Integer(required=True)
    tipo = fields.String(
        required=True,
        validate=validate.OneOf(["siembra", "fertilizacion", "fumigacion", "poda", "riego", "cosecha"]),
    )
    fecha = fields.Date(required=True)
    estado = fields.String(
        validate=validate.OneOf(["Programada", "Completada", "Pendiente", "Vencida"]),
        allow_none=True,
    )
    insumo = fields.String(allow_none=True)
    dosis = fields.String(allow_none=True)
    observaciones = fields.String(allow_none=True)


labor_schema = LaborSchema()
labores_schema = LaborSchema(many=True)
labor_create_schema = LaborCreateSchema()
