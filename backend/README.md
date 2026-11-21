# Backend AgroGestion

Backend Flask organizado como monolito modular por capas. La aplicacion usa SQLAlchemy con PyMySQL para conectarse a MySQL/MariaDB de XAMPP, Flask-Login y Flask-Bcrypt para sesiones y autenticacion, y Marshmallow para validar y serializar datos.

## Preparar y ejecutar en Windows

Desde una terminal PowerShell:

```powershell
cd C:\Users\pipeg\Desktop\VAGRO\agrogestion\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python run.py
```

Si `.venv` ya existe, no vuelvas a crearla: activa el entorno e inicia Flask con `python run.py`. Inicia MySQL desde XAMPP y configura `backend/.env` con `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. No reemplaces un `.env` existente sin conservar sus valores, y no lo compartas.

La aplicacion se sirve como SPA en `http://127.0.0.1:5000`; el inicio de sesion usa `POST /api/auth/login`. La ruta `/login` redirige a la misma pantalla principal de acceso.

## API disponible

### Iniciar sesion

`POST /api/auth/login` valida un objeto JSON con `username` y `password`, verifica el hash BCrypt guardado y crea una sesion Flask:

```powershell
$sesion = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$datos = @{ username = "admin"; password = "Admin123!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/login `
  -ContentType "application/json" -Body $datos -WebSession $sesion
```

El ejemplo usa las credenciales indicadas en el script de inicializacion. Solo funcionara si ese usuario y su hash estan presentes en la base de datos.

En la base de datos local verifique que el hash actual de `admin` corresponda a `Admin123!`: la comprobacion de esta implementacion encontro que el hash que estaba guardado no coincide, por lo que el login de ese usuario devolvera 401 hasta actualizarlo. Genere un hash nuevo desde `backend`:

```powershell
python -c "import bcrypt; print(bcrypt.hashpw(b'Admin123!', bcrypt.gensalt()).decode())"
```

Copie el resultado y actualice solo ese usuario desde phpMyAdmin:

```sql
UPDATE usuarios
SET password_hash = '<HASH_BCRYPT_GENERADO>'
WHERE username = 'admin';
```

La respuesta satisfactoria contiene `message` y los campos publicos `username`, `nombre_completo` y `rol`; no devuelve el hash ni el ID interno. Credenciales invalidas devuelven HTTP 401 y datos incompletos HTTP 400.

Para cerrar la sesion, conserva el mismo objeto `$sesion`:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/logout `
  -WebSession $sesion
```

### Consultar un lote por QR (publico)

`GET /api/lotes/qr/<codigo_qr>` no requiere iniciar sesion. El servicio responde unicamente para lotes `ACTIVO`:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:5000/api/lotes/qr/LOTE-CAF-001
```

La respuesta tiene esta forma:

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

Los codigos inexistentes o asociados a lotes inactivos devuelven HTTP 404. El generador `app.shared.utils.qr_generator.generate_qr_base64(data)` produce un PNG QR codificado en base64.

## Estado

Los modulos de autenticacion de usuarios y consulta publica de lotes estan implementados. Las entidades se mapean a las tablas existentes `usuarios`, `cultivos` y `lotes`; la aplicacion no ejecuta migraciones ni crea esas tablas. El modulo `labores` aun no esta implementado.
