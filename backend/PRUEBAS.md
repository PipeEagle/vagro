# Pruebas - AgroGestion Backend

Estrategia de pruebas para el backend de AgroGestion, siguiendo el patrón del manual ALOJAMIENTOS (fase 06.01).

## Alcance de pruebas

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| Unitarias | pytest | Servicios, repositorios, DTOs, utilidades compartidas |
| Integración | pytest + MySQL de prueba | Autenticación, consulta pública QR, conexión a BD |
| Funcionales | Postman / curl | Endpoints REST, códigos HTTP, respuestas JSON |
| Regresión | pytest | Re-test después de cambios en backend |
| Seguridad | Postman / pytest | 401 sin credenciales, 403 sin rol admin, 404 lote inexistente |

## Entorno de pruebas

- Base de datos MySQL de prueba separada (no usar la BD de desarrollo para pruebas destructivas)
- Fixtures para registro, permisos, CRUD e imágenes (cuando existan)
- Variables de entorno por entorno (`.env` no versionado)

## Casos de prueba prioritarios

### Autenticación (`/api/auth/login`)

1. Credenciales válidas → 200 con `message` y `user` (username, nombre_completo, rol)
2. Credenciales inválidas → 401
3. Cuerpo no JSON → 400
4. Campos faltantes → 400 (validación Marshmallow)
5. Usuario inactivo → 401
6. Logout sin sesión → 401

### Consulta pública de lote (`/api/lotes/qr/:codigo_qr`)

1. Lote ACTIVO existente → 200 con `{nombre, estado, cultivo, hectareas}`
2. Lote inexistente → 404
3. Lote inactivo (EN_DESCANSO o FINALIZADO) → 404
4. Sin autenticación requerida → 200 (público)

### Utilidades compartidas

1. `generate_qr_base64(data)` retorna string base64 válido
2. `AppException(message, status_code)` tiene atributos `message` y `status_code`

## Ejecución

Desde `backend/` con entorno virtual activado:

```powershell
# Instalar dependencias de prueba (si no están en requirements.txt)
pip install pytest pytest-flask

# Ejecutar todas las pruebas
pytest

# Ejecutar con reporte detallado
pytest -v
```

## Línea base

Registrar versiones Python/Node/MySQL, commit, pruebas ejecutadas y bloqueos reales.
Separar backend implementado de pendientes y del despliegue Docker no ejecutado.

No confundir ejemplos de documentación con código ya escrito o pruebas ejecutadas.
