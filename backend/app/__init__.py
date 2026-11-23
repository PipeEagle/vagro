"""Application factory for Agrogestion."""

import os
from flask import Flask, Response, jsonify, redirect, request, send_from_directory, url_for
from werkzeug.exceptions import HTTPException, NotFound

from app.config import Config
from app.extensions import bcrypt, db, login_manager, ma
from app.modules.labores.controllers.labor_controller import labores_bp
from app.modules.lotes.controllers.lote_controller import lotes_bp
from app.modules.cultivos.controllers.cultivo_controller import cultivos_bp
from app.modules.usuarios.controllers.auth_controller import auth_bp, auth_pages_bp
from app.modules.usuarios.controllers.user_controller import usuarios_bp
from app.modules.fincas.controllers.finca_controller import fincas_bp
from app.modules.cosechas.controllers.cosecha_controller import cosechas_bp
from app.modules.insumos.controllers.insumo_controller import insumos_bp
from app.modules.eventos.controllers.evento_controller import eventos_bp
from app.modules.usuarios.services.auth_service import load_user
from app.shared.utils.app_exception import AppException


SPA_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    ),
    "frontend",
    "spa",
)


def create_app(config_class: type[Config] = Config) -> Flask:
    """Create and configure a Flask application instance."""
    app = Flask(
        __name__,
        template_folder=None,
        static_folder=None,
    )
    app.config.from_object(config_class)
    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth_pages.spa_login_redirect"
    login_manager.user_loader(load_user)

    @login_manager.unauthorized_handler
    def handle_unauthorized():
        """Return JSON errors for API requests and preserve browser redirects."""
        if request.path.startswith("/api/"):
            return jsonify({"error": "Se requiere iniciar sesion."}), 401
        return redirect(url_for("auth_pages.spa_login_redirect"))

    app.register_blueprint(auth_bp)
    app.register_blueprint(auth_pages_bp)
    app.register_blueprint(lotes_bp)
    app.register_blueprint(cultivos_bp)
    app.register_blueprint(labores_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(fincas_bp)
    app.register_blueprint(cosechas_bp)
    app.register_blueprint(insumos_bp)
    app.register_blueprint(eventos_bp)

    @app.get("/css/<path:filename>")
    def spa_css(filename):
        """Serve SPA CSS assets."""
        return send_from_directory(os.path.join(SPA_DIR, "css"), filename)

    @app.get("/js/<path:filename>")
    def spa_js(filename):
        """Serve SPA JS assets."""
        return send_from_directory(os.path.join(SPA_DIR, "js"), filename)

    @app.get("/")
    def spa_home():
        """Serve the SPA entry point."""
        return send_from_directory(SPA_DIR, "index.html")

    @app.get("/<path:subpath>")
    def spa_catchall(subpath):
        """Serve the SPA for client-side routes, excluding API paths."""
        if subpath.startswith("api/") or subpath.startswith("static/"):
            raise NotFound()
        # Serve index.html for all SPA routes (router handles the view)
        return send_from_directory(SPA_DIR, "index.html")

    @app.after_request
    def add_security_headers(response):
        """Add security headers to all responses."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
        return response

    @app.errorhandler(AppException)
    def handle_app_exception(error: AppException) -> tuple[Response, int]:
        """Return expected application errors as JSON."""
        return jsonify({"error": error.message}), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException) -> Response | tuple[Response, int]:
        """Return API HTTP errors in a consistent JSON shape."""
        if request.path.startswith("/api/"):
            return jsonify({"error": error.description}), error.code or 500
        return error

    return app
