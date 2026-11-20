"""Shared backend utilities."""

from app.shared.utils.app_exception import AppException
from app.shared.utils.qr_generator import generate_qr_base64

__all__ = ["AppException", "generate_qr_base64"]
