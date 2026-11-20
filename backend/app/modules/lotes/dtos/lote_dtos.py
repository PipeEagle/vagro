"""Public response schemas for plot lookups."""

from marshmallow import fields

from app.extensions import ma


class CultivoPublicSchema(ma.Schema):
    """Expose the public name of a crop type."""

    nombre = fields.String(dump_only=True)


class LotePublicSchema(ma.Schema):
    """Expose only non-sensitive plot and crop information."""

    nombre = fields.String(dump_only=True)
    estado = fields.String(dump_only=True)
    cultivo = fields.Nested(CultivoPublicSchema, dump_only=True)
    hectareas = fields.Float(dump_only=True)


lote_public_schema = LotePublicSchema()
