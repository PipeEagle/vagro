"""Pruebas unitarias basicas para el backend de AgroGestion."""

import pytest
from app import create_app
from app.extensions import db


@pytest.fixture
def app():
    """Create a Flask app configured for testing."""
    app = create_app()
    app.config.update(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SECRET_KEY": "test-secret-key",
            "WTF_CSRF_ENABLED": False,
        }
    )
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()


def test_app_creates(app):
    """Verify the app is created and in testing mode."""
    assert app is not None
    assert app.config["TESTING"] is True


def test_database_connection(app, client):
    """Verify the in-memory database can be accessed."""
    with app.app_context():
        result = db.session.execute(db.text("SELECT 1")).scalar()
        assert result == 1
