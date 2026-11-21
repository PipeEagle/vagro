"""Input schemas for authentication requests."""

from marshmallow import fields, validate

from app.extensions import ma
from app.shared.utils.validators import validate_not_blank


class LoginSchema(ma.Schema):
    """Validate administrator login credentials."""

    username = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=50), validate_not_blank],
    )
    password = fields.String(
        required=True,
        load_only=True,
        validate=[validate.Length(min=1), validate_not_blank],
    )


login_schema = LoginSchema()
