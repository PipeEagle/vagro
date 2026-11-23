# Backend AgroGestion

Backend Flask con SQLAlchemy, sesiones Flask-Login, validación Marshmallow y una API REST organizada por dominios.

## Requisitos y arranque local

- Python 3.10 o superior.
- MySQL/MariaDB iniciado y una base cuyo esquema sea compatible con los modelos actuales.
- Variables de conexión configuradas en `backend/.env`.

Desde PowerShell, en la raíz del proyecto:

```powershell
.\iniciar.ps1
```

El script crea `backend/.venv` si no existe, instala `requirements.txt` e inicia `run.py`. Para iniciar manualmente:

```powershell
Set-Location .\backend
.\.venv\Scripts\Activate.ps1
python run.py
```

La aplicación queda disponible en `http://127.0.0.1:5000`. La interfaz SPA se sirve desde `frontend/spa/`; Flask no usa plantillas Jinja ni la carpeta estática anterior.

## Base de datos y usuario inicial

Configura `backend/.env` a partir de `.env.example` solo si no existe uno, y conserva los valores de conexión vigentes. La aplicación no crea tablas ni aplica migraciones automáticamente al arrancar. Revisa los scripts SQL contra los modelos antes de aplicarlos y respalda la base de datos.

Para crear un administrador inicial, con la base y la tabla `usuarios` ya preparadas:

```powershell
Set-Location .\backend
.\.venv\Scripts\python.exe .\scripts\crear_admin.py
```

El script crea `admin` con contraseña inicial `Admin123!` si ese nombre todavía no existe. No cambia la contraseña de un usuario existente. Usa esas credenciales solo cuando sepas que el usuario se creó con este script; reemplaza la contraseña de ejemplo antes de utilizar datos reales.

## API disponible

Todas las rutas usan el prefijo `/api`.

| Dominio | Rutas principales |
|---|---|
| Sesión | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Lotes públicos | `GET /lotes/qr/<codigo_qr>`, `GET /lotes/qr/<codigo_qr>/image` |
| Usuarios | CRUD en `/usuarios` y `/usuarios/<id>` |
| Fincas | CRUD en `/fincas` y `/fincas/<id>` |
| Cultivos | CRUD en `/cultivos` y `/cultivos/<id>` |
| Lotes | CRUD en `/lotes` y `/lotes/<id>` |
| Labores | CRUD en `/labores` y `/labores/<id>` |
| Cosechas | CRUD en `/cosechas` y `/cosechas/<id>` |
| Insumos | CRUD en `/insumos` y `/insumos/<id>` |
| Eventos | CRUD en `/eventos` y `/eventos/<id>` |

Las rutas de consulta QR son públicas. El CRUD de usuarios exige sesión y rol administrador. En el resto de los CRUD la autenticación no está aplicada uniformemente en el código actual; no se deben considerar rutas privadas ni exponer el servidor públicamente hasta completar y verificar la autorización.

### Inicio y cierre de sesión

`POST /api/auth/login` recibe `username` y `password` como JSON y crea una sesión Flask:

```powershell
$sesion = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$datos = @{ username = "admin"; password = "Admin123!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/login `
  -ContentType "application/json" -Body $datos -WebSession $sesion
```

La respuesta incluye `message` y un objeto `user` con `username`, `nombre_completo`, `rol` y `finca_id`. `GET /api/auth/me` devuelve la identidad de la sesión activa. Conserva `$sesion` para cerrar sesión:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/logout `
  -WebSession $sesion
```

### Consulta pública por QR

`GET /api/lotes/qr/<codigo_qr>` devuelve los datos públicos de un lote activo. Los códigos inexistentes o asociados a lotes no activos responden 404. La ruta `/image` devuelve la imagen QR.

## Pruebas

Desde `backend`, ejecuta:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Las pruebas usan SQLite en memoria y crean un esquema aislado; no requieren conectarse a MySQL ni modifican la base local.

## Esquema y migraciones

`Flask-Migrate` aparece como dependencia, pero no está inicializado en la aplicación. No hay migraciones automáticas. Los cambios de esquema requieren una migración SQL revisada y aplicada explícitamente; consulta [MIGRACIONES.md](./MIGRACIONES.md) y [MODELO_DATOS.md](./MODELO_DATOS.md).
