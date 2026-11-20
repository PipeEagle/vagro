"""Application configuration loaded from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import URL


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "development-only-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or URL.create(
        drivername="mysql+pymysql",
        username=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        host=os.environ.get("DB_HOST", "127.0.0.1"),
        port=int(os.environ.get("DB_PORT", "3306")),
        database=os.environ.get("DB_NAME", "agrogestion"),
    ).render_as_string(hide_password=False)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
