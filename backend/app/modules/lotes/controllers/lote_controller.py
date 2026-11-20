"""HTTP routes for public plot lookup."""

from flask import Blueprint, Response, jsonify

from app.modules.lotes.services.lote_service import LoteService

lotes_bp = Blueprint("lotes", __name__, url_prefix="/api/lotes")


@lotes_bp.get("/qr/<string:codigo_qr>")
def get_lote_by_qr(codigo_qr: str) -> Response:
    """Return public plot details for a QR code without authentication."""
    lote = LoteService.get_lote_details_by_qr(codigo_qr)
    return jsonify({"data": lote})
