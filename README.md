# 🌱 AgroGestión

**AgroGestión** es una aplicación web para administrar fincas y dar seguimiento a sus lotes, cultivos, labores y cosechas de café y plátano. La interfaz actual es una SPA conectada a una API Flask y a una base de datos MySQL/MariaDB.

## 🚀 Características Principales

### Consulta pública
- Consulta de lotes activos por código QR, sin iniciar sesión.
- Visualización de información del lote y del cultivo asociado.

### Interfaz de gestión
- Inicio de sesión y vistas de dashboard, lotes, cultivos, labores, cosechas, insumos, fincas y usuarios.
- Operaciones de gestión desde la SPA, con filtros por finca y vistas de detalle.
- El alta de usuario no asigna finca; la asignación se realiza posteriormente.

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.
- **Backend:** Python 3.10+, Flask.
- **Base de Datos:** MySQL/MariaDB para desarrollo; SQLite en la suite de pruebas.
- **Arquitectura:** Monolito Modular por Capas (Controllers, Services, Repositories, Entities, DTOs).

## 🏗️ Arquitectura de Software

El proyecto sigue un patrón de **Monolito Modular**. Los dominios `usuarios`, `fincas`, `cultivos`, `lotes`, `labores`, `cosechas`, `insumos` y `eventos` están organizados en `backend/app/modules/`, con separación por capas:

1. **Controllers:** Manejo de rutas HTTP y peticiones (Blueprints de Flask).
2. **Services:** Lógica de negocio, validaciones y orquestación.
3. **Repositories:** Abstracción de la base de datos (consultas SQLAlchemy).
4. **Entities:** Modelos ORM que representan las tablas de MySQL.
5. **DTOs:** Objetos de Transferencia de Datos para validación de entrada/salida.

## 📋 Prerrequisitos

- Python 3.10 o superior.
- MySQL 8.0 o superior (XAMPP incluye MariaDB).
- Git.
- Navegador web moderno.

## ⚙️ Instalación y Despliegue

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/agrogestion.git
cd agrogestion
```

### 2. Instalar y ejecutar el backend

En PowerShell, desde la raíz de `agrogestion`, ejecuta:

```powershell
.\iniciar.ps1
```

El script crea el entorno virtual si hace falta, instala las dependencias e inicia Flask. Abre `http://127.0.0.1:5000`. También puedes iniciar manualmente desde `backend` con `.\.venv\Scripts\Activate.ps1` y `python run.py`. Consulta [arranque.txt](./arranque.txt) y [backend/README.md](./backend/README.md) para los requisitos de base de datos y el usuario inicial.

### 3. Configurar la base de datos con XAMPP

El backend se conecta a MySQL/MariaDB mediante SQLAlchemy y PyMySQL. Inicia MySQL desde XAMPP y configura `backend/.env` con el nombre de la base, puerto y credenciales. Si el archivo todavía no existe, créalo a partir del ejemplo sin sobrescribir un `.env` existente:

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Edita `backend/.env` con los valores reales. En una instalación local típica de XAMPP, el host es `127.0.0.1`, el puerto `3306`, el usuario `root` y la contraseña puede estar vacía. La base y las tablas indicadas por `DB_NAME` deben existir y ser compatibles con los modelos actuales.

El arranque no crea tablas ni ejecuta migraciones. Los scripts SQL del repositorio deben revisarse y compararse con los modelos antes de aplicarlos; respalda cualquier base que contenga datos.

Para comprobar la conexión, abre una terminal en `backend`, activa el entorno virtual e inicia la consola de Flask:

```powershell
$env:FLASK_APP = "run:app"
flask shell
```

En la consola de Flask:

```python
from sqlalchemy import text
from app.extensions import db
db.session.execute(text("SELECT 1")).scalar_one()
```

El resultado esperado es `1`. Esto comprueba la conectividad, pero no crea ni modifica tablas. No compartas ni subas `backend/.env`; Git lo ignora.

### 4. Configurar Frontend

El frontend es una SPA ubicada en `frontend/spa/`, servida por Flask. No usa las antiguas carpetas `frontend/static` ni `frontend/templates`.

Live Server puede mostrar los archivos de la SPA, pero no conecta la interfaz con la API de Flask; por eso no se recomienda para ejecutar la aplicación completa. En producción, despliega Flask detrás de un servidor WSGI y, si se requiere, Nginx o Apache como proxy inverso.

### Pruebas y límite de seguridad

Desde `backend`, ejecuta la suite aislada en SQLite con `.\.venv\Scripts\python.exe -m pytest -q`. Las operaciones de usuarios requieren sesión y rol administrador; la protección de los demás endpoints CRUD no es uniforme en el estado actual. No expongas el servidor a Internet ni uses datos reales hasta revisar y aplicar autorización en todas las rutas que la requieran.

## 📁 Estructura del Proyecto

```text
agrogestion/
├── backend/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── cultivos/
│   │   │   ├── cosechas/
│   │   │   ├── eventos/
│   │   │   ├── fincas/
│   │   │   ├── insumos/
│   │   │   ├── labores/
│   │   │   ├── lotes/
│   │   │   └── usuarios/
│   │   └── shared/
│   │   ├── config.py
│   │   └── extensions.py
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
├── database/
│   └── init.sql
├── frontend/
│   └── spa/
│       ├── css/
│       └── js/
├── iniciar.ps1
├── arranque.txt
└── README.md
```
