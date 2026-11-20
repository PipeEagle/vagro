# Ejemplo de Configuración - AgroGestion Backend

Ejemplo de archivo de configuración y variables de entorno. **No versionar `.env` con valores reales.**

## `.env.example`

```ini
SECRET_KEY=replace-with-a-long-random-value
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=agrogestion
DB_USER=root
DB_PASSWORD=
```

## `.env` (local, no versionar)

```ini
SECRET_KEY=7351054a46b0e2bef4ee6ee42e5be27281d222a0a38cca5692acbc3620e36b13
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agrogestion
DB_USER=root
DB_PASSWORD=
```

## `app/config.py` (resumen de configuración)

```python
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
```

## Reglas de seguridad

- `.env` está en `.gitignore` — no compartir ni subir a repositorio
- `SECRET_KEY` debe ser un valor aleatorio largo en producción
- `DB_PASSWORD` vacía solo para desarrollo local XAMPP
- Nunca exponer credenciales, rutas absolutas ni claves en el repositorio
- Las variables de entorno no deben afectar el código

## Equivalencia futura (producción)

Cuando se despliegue en entorno productivo (Azure VM, Docker, etc.):
- `DATABASE_URL` puede usarse como cadena completa en lugar de construirla por partes
- `SECRET_KEY` y `DB_PASSWORD` se inyectan como variables de entorno del servidor
- `DB_HOST` apunta al servidor MySQL privado (no localhost)
- HTTPS con cookies Secure/HttpOnly para sesiones (cuando se implemente JWT con cookies)
