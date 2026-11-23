# Esquema y migraciones de AgroGestion

## Estado actual

- La aplicación no crea tablas ni modifica la base de datos al arrancar.
- `Flask-Migrate` está declarado en `requirements.txt`, pero no se registra en `app/extensions.py` ni se inicializa en la fábrica Flask. Por tanto, los comandos `flask db` no forman parte del flujo configurado actualmente.
- `database/migrations/` contiene scripts SQL puntuales; no constituye un historial Alembic completo ni una instalación inicial verificada.
- `backend/scripts/crear_base_datos.sql` crea únicamente la base de datos, no sus tablas.
- `database/init.sql` incluye DDL y datos de ejemplo, pero presenta diferencias conocidas con los modelos ORM. Revisa [MODELO_DATOS.md](./MODELO_DATOS.md) antes de utilizarlo.

## Procedimiento para un cambio de esquema

1. Identifica y respalda la base de datos destino.
2. Compara el esquema real con los modelos de `backend/app/modules/*/entities/models.py`.
3. Escribe un cambio SQL revisable y compatible con los datos existentes. Evita recrear tablas o ejecutar seeds sin comprobar sus efectos.
4. Aplica el cambio primero en una base local aislada.
5. Ejecuta las pruebas automatizadas y verifica las operaciones relevantes contra el motor MySQL/MariaDB previsto.
6. Registra el propósito, el orden de aplicación y cualquier paso de reversión del script.

No uses las pruebas SQLite como prueba de compatibilidad completa con MySQL; los motores tienen diferencias de tipos, enums y restricciones.

## Conexión de verificación

Con MySQL iniciado y `backend/.env` configurado, desde `backend` se puede comprobar la conexión sin modificar el esquema:

```powershell
$env:FLASK_APP = "run:app"
flask shell
```

```python
from sqlalchemy import text
from app.extensions import db
db.session.execute(text("SELECT 1")).scalar_one()
```

El resultado `1` confirma conectividad, no que el esquema esté sincronizado.
