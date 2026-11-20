# Migraciones - AgroGestion Backend

Plan de migraciones para la base de datos MySQL de AgroGestion.

## Estado actual

La base de datos `agrogestion` ya existe en MySQL/MariaDB local (XAMPP, puerto 3306) con las tablas:
- `usuarios`
- `cultivos`
- `lotes`
- `labores` (vacía)

El script `database/init.sql` en la raíz del proyecto está vacío (solo comentarios de encabezado).

## Estrategia de migración

El backend usa **Flask-SQLAlchemy** con **PyMySQL**. Por ahora no se ejecuta `Flask-Migrate`/`Alembic` automáticamente.

### Reglas de migración

1. **Nunca recrear tablas durante cada sprint** — la evolución del esquema debe ser controlada
2. **Generar, revisar y aplicar migración con `flask db upgrade`** cuando se implemente Flask-Migrate
3. **Cualquier cambio de esquema requiere script SQL manual** y revisión de impacto antes de aplicar
4. **No crear tablas adicionales en v1.0** — solo las cuatro tablas existentes

## Scripts de base de datos

### `scripts/crear_base_datos.sql`

Script para crear la base de datos `agrogestion` si no existe. Solo crea la BD, no las tablas.

```sql
CREATE DATABASE IF NOT EXISTS agrogestion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### `scripts/crear_admin.py`

Script manual para crear el primer administrador (hash BCrypt generado en tiempo de ejecución).

```python
from app import create_app
from app.extensions import db, bcrypt
from app.modules.usuarios.entities.models import Usuario

app = create_app()
with app.app_context():
    username = "admin"
    password = "Admin123!"
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    
    existing = Usuario.query.filter_by(username=username).first()
    if existing:
        print(f"El usuario '{username}' ya existe.")
    else:
        admin = Usuario(
            username=username,
            password_hash=password_hash,
            nombre_completo="Administrador Principal",
            rol="SUPERADMIN",
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print(f"Administrador '{username}' creado exitosamente.")
```

## Plan de implementación posterior

1. Instalar `Flask-Migrate` y `alembic` en `requirements.txt`
2. Inicializar migraciones: `flask db init`
3. Generar migración inicial basada en modelos existentes: `flask db migrate -m "initial schema"`
4. Aplicar migración: `flask db upgrade`
5. Verificar conectividad: `SELECT 1` y `SHOW TABLES`

## Verificación

Desde el entorno virtual activado en `backend/`:

```powershell
$env:FLASK_APP = "run:app"
flask shell
```

```python
from sqlalchemy import text
from app.extensions import db
db.session.execute(text("SELECT 1")).scalar_one()
# Resultado esperado: 1
```
