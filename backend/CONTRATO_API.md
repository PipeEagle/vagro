# Contrato de API - AgroGestion Backend (v1.0)

Contrato de las operaciones REST del backend. Prefijo base: `/api`.
Respuestas JSON uniformes. Códigos de error: 400, 401, 403, 404, 409, 413, 415, 422.

## Autenticación (usuarios)

| # | Método | Ruta | Autenticación | Descripción | Éxito | Errores |
|---|--------|------|---------------|-------------|-------|---------|
| 1 | POST | `/api/auth/login` | No | Valida credenciales y crea sesión Flask-Login | 200 `{message, user}` | 400, 401 |
| 2 | POST | `/api/auth/logout` | Sí | Cierra la sesión actual | 200 `{message}` | 401 |

### POST /api/auth/login

**Request (JSON):**
```json
{ "username": "admin", "password": "Admin123!" }
```

**Response 200:**
```json
{
  "message": "Inicio de sesion exitoso.",
  "user": {
    "username": "admin",
    "nombre_completo": "Administrador Principal",
    "rol": "SUPERADMIN"
  }
}
```

**Response 401:** `{ "error": "Usuario o contrasena incorrectos." }`

### POST /api/auth/logout

**Response 200:**
```json
{ "message": "Sesion cerrada." }
```

**Response 401:** `{ "error": "No hay una sesion activa." }`

## Consultas públicas (lotes)

| # | Método | Ruta | Autenticación | Descripción | Éxito | Errores |
|---|--------|------|---------------|-------------|-------|---------|
| 3 | GET | `/api/lotes/qr/:codigo_qr` | No | Consulta pública de lote por código QR | 200 `{data}` | 404 |

### GET /api/lotes/qr/:codigo_qr

**Response 200:**
```json
{
  "data": {
    "nombre": "Lote Cafe Norte",
    "estado": "ACTIVO",
    "cultivo": { "nombre": "Cafe" },
    "hectareas": 5.5
  }
}
```

**Response 404:** `{ "error": "No se encontro un lote activo para ese codigo QR." }`

## Utilidades compartidas

- `AppException(message, status_code)` — excepciones de aplicación que retornan JSON con código HTTP
- `generate_qr_base64(data)` — genera PNG QR y retorna representación base64

## Reglas de seguridad

- `POST /api/auth/login` y `POST /api/auth/logout` requieren cuerpo JSON válido
- `POST /api/auth/logout` verifica `current_user.is_authenticated`
- La consulta pública de lotes no requiere autenticación ni sesión
- `admin_required` protege rutas de administrador: verifica autenticación y rol en {ADMIN, SUPERADMIN}
- Flask-Login `login_manager.login_view = "auth_pages.spa_login_redirect"` redirects browser requests to the SPA sign-in screen
- `user_loader` carga usuario activo por ID desde `UserRepository.get_by_id()`

## Formato de errores JSON

```json
{ "error": "Mensaje descriptivo del error" }
```

Los errores HTTP de Flask (`HTTPException`) en rutas `/api/` retornan JSON con `error.description` y el código HTTP correspondiente.
