"""Schemas for user record requests and responses."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class UserSchema(ma.Schema):
    """Serialize/deserialize a full user record."""

    class Meta:
        fields = (
            "id", "username", "nombre_completo", "rol", "finca_id", "estado",
        )

    id = fields.Integer(dump_only=True)
    username = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    nombre_completo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    rol = fields.String(
        required=True,
        validate=validate.OneOf(["SUPERADMIN", "ADMIN", "MAYORDOMO"]),
    )
    finca_id = fields.Integer(allow_none=True)
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["Activo", "Inactivo"]),
    )


class UserCreateSchema(ma.Schema):
    """Validate payload for creating a user record."""

    username = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    password = fields.String(
        required=True,
        load_only=True,
        validate=[validate.Length(min=1), validate_not_blank],
    )
    nombre_completo = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=150), validate_not_blank],
    )
    rol = fields.String(
        required=True,
        validate=validate.OneOf(["SUPERADMIN", "ADMIN", "MAYORDOMO"]),
    )
    finca_id = fields.Integer(allow_none=True)
    estado = fields.String(
        validate=validate.OneOf(["Activo", "Inactivo"]),
        allow_none=True,
    )


user_schema = UserSchema()
usuarios_schema = UserSchema(many=True)
user_create_schema = UserCreateSchema()
