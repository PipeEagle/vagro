"""Input schemas for authentication requests."""

from marshmallow import fields, validate

from app.extensions import ma


class LoginSchema(ma.Schema):
    """Validate administrator login credentials."""

    username = fields.String(
        required=True,
        validate=validate.Length(min=1, max=50),
    )
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=1),
    )


login_schema = LoginSchema()
