"""Utilities for generating QR code images."""

import base64
from io import BytesIO

import qrcode


def generate_qr_base64(data: str) -> str:
    """Generate a PNG QR code and return its raw base64 representation."""
    image = qrcode.make(data)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")
