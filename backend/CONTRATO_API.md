# Contrato de API - AgroGestion

Prefijo base: `/api`. Los endpoints intercambian JSON, salvo la ruta de imagen QR. Los errores JSON usan la forma `{ "error": "..." }`; algunos errores de validación agregan `details`.

## Sesión y autenticación

| Método | Ruta | Acceso actual | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Valida credenciales y crea sesión Flask-Login |
| POST | `/api/auth/logout` | Sesión opcional | Cierra la sesión del navegador si existe |
| GET | `/api/auth/me` | Sesión requerida | Devuelve la identidad activa |

### `POST /api/auth/login`

Request:

```json
{ "username": "admin", "password": "..." }
```

La respuesta satisfactoria incluye `message` y `user` (`username`, `nombre_completo`, `rol`, `finca_id`). No devuelve el hash de contraseña. El usuario y su contraseña dependen de la base de datos configurada; las credenciales de ejemplo no se garantizan para una instalación existente.

Respuestas habituales: `200` al iniciar sesión, `400` ante JSON o campos inválidos y `401` si las credenciales no son válidas.

### `GET /api/auth/me`

Devuelve el objeto `user` con `username`, `nombre_completo`, `rol` y `finca_id`. Sin sesión responde `401`.

### `POST /api/auth/logout`

Cierra la sesión enviada en la cookie del navegador, si existe, y devuelve `200`. El controlador actual no exige autenticación previa.

## Consulta pública de lotes por QR

| Método | Ruta | Acceso actual | Descripción |
|---|---|---|---|
| GET | `/api/lotes/qr/<codigo_qr>` | Público | Consulta el detalle público de un lote activo |
| GET | `/api/lotes/qr/<codigo_qr>/image` | Público | Genera/entrega la imagen QR |

La consulta de datos responde con un objeto `data` que contiene nombre, estado, cultivo y hectáreas. Un código inexistente o un lote no activo responde `404`.

## CRUD por dominio

Para cada recurso, las rutas de colección permiten `GET` (listar) y `POST` (crear); las rutas por ID permiten `GET` (consultar), `PUT` (actualizar) y `DELETE` (eliminar):

| Recurso | Colección | Ruta individual |
|---|---|---|
| Usuarios | `/api/usuarios` | `/api/usuarios/<id>` |
| Fincas | `/api/fincas` | `/api/fincas/<id>` |
| Cultivos | `/api/cultivos` | `/api/cultivos/<id>` |
| Lotes | `/api/lotes` | `/api/lotes/<id>` |
| Labores | `/api/labores` | `/api/labores/<id>` |
| Cosechas | `/api/cosechas` | `/api/cosechas/<id>` |
| Insumos | `/api/insumos` | `/api/insumos/<id>` |
| Eventos | `/api/eventos` | `/api/eventos/<id>` |

Los campos aceptados y devueltos dependen del esquema DTO de cada dominio. Las respuestas de validación usan `400`; un identificador inexistente suele responder `404`. Las restricciones de integridad pueden responder `409`.

## Autorización: estado actual

- El CRUD de `/api/usuarios` exige una sesión y un rol `ADMIN` o `SUPERADMIN`.
- Las rutas QR son públicas por diseño.
- Los demás CRUD no aplican una protección de autenticación uniforme en el estado actual. No asumir que son privados. Antes de desplegar, añadir y probar autorización en cada ruta según el rol y la finca.
- La interfaz redirige a la pantalla de acceso si no hay sesión, pero una restricción visual en la SPA no sustituye la autorización del servidor.

## Ejemplo PowerShell con sesión

```powershell
$sesion = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$datos = @{ username = "admin"; password = "..." } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/login `
  -ContentType "application/json" -Body $datos -WebSession $sesion
Invoke-RestMethod -Uri http://127.0.0.1:5000/api/auth/me -WebSession $sesion
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/logout `
  -WebSession $sesion
```

Sustituye `...` por credenciales de desarrollo conocidas; no guardes contraseñas reales en scripts o repositorios.
