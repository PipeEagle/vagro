"""Reusable validation helpers for request schemas."""

from marshmallow import ValidationError


def validate_not_blank(value: str) -> None:
    """Reject strings containing only whitespace."""
    if not value.strip():
        raise ValidationError("Este campo no puede estar vacio.")
