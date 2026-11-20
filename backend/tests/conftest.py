"""Pytest configuration for AgroGestion backend tests."""

import pytest
from app import create_app
from app.extensions import db


@pytest.fixture(scope="session")
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
    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()
