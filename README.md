# 🌱 AgroGestión

**AgroGestión** es una plataforma web diseñada para la gestión, registro y trazabilidad de labores agrícolas, enfocada específicamente en cultivos de café y plátano. Permite el control en tiempo real de las actividades en campo mediante un sistema de escaneo de códigos QR, asegurando la transparencia y eficiencia entre los trabajadores de campo y la administración.

## 🚀 Características Principales

### Flujo del Trabajador de Campo (Acceso Público)
- Escaneo de código QR físico ubicado en el lote.
- Visualización del estado actual del cultivo y lote.
- Registro rápido de labores (fumigación, fertilización, cosecha, etc.) sin necesidad de credenciales.

### Flujo del Administrador (Acceso Privado)
- Dashboard con notificaciones de registros pendientes.
- Verificación presencial de las labores reportadas.
- Confirmación o rechazo de tareas en el panel de administración.
- Actualización automática de ciclos del cultivo y generación de reportes de trazabilidad.

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.
- **Backend:** Python 3.10+, Flask.
- **Base de Datos:** MySQL 8.0.
- **Arquitectura:** Monolito Modular por Capas (Controllers, Services, Repositories, Entities, DTOs).

## 🏗️ Arquitectura de Software

El proyecto sigue un patrón de **Monolito Modular**. Cada dominio de negocio (Lotes, Labores, Cultivos, Usuarios) está aislado en su propio módulo dentro de `backend/app/modules/`, respetando la separación de responsabilidades:

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

Desde la raíz del proyecto, ejecuta en PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Abre `http://127.0.0.1:5000` en el navegador. La pantalla de acceso es visual; la autenticación se ofrece por API. Consulta [backend/README.md](./backend/README.md) para probar el inicio de sesión y la consulta pública de lotes.

### 3. Configurar la base de datos con XAMPP

El backend se conecta a MySQL/MariaDB de XAMPP mediante SQLAlchemy y PyMySQL. Inicia MySQL desde el panel de XAMPP y confirma en phpMyAdmin el nombre de la base, puerto y credenciales. Si `backend/.env` todavía no existe, créalo a partir del ejemplo:

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Edita `backend/.env` con los valores reales. En una instalación local típica de XAMPP, el host es `127.0.0.1`, el puerto `3306`, el usuario `root` y la contraseña puede estar vacía. La base indicada por `DB_NAME` debe existir.

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

El resultado esperado es `1`. Esto comprueba la conectividad, pero no crea ni modifica tablas. Los modelos de usuarios, cultivos y lotes corresponden al esquema compartido; el módulo de labores aún no está implementado. No compartas ni subas `backend/.env`; Git lo ignora.

### 4. Configurar Frontend

El frontend usa plantillas Jinja y archivos estáticos servidos por Flask. Para desarrollo local, ejecuta `python run.py` desde `backend` y abre `http://127.0.0.1:5000` en el navegador. Flask renderiza las plantillas de `frontend/templates/` y sirve los recursos de `frontend/static/`.

Live Server puede servir archivos estáticos aislados, pero no interpreta Jinja ni conecta las páginas con las rutas de Flask; por eso no se recomienda para ejecutar la aplicación completa. En producción, despliega Flask detrás de un servidor WSGI y, si se requiere, Nginx o Apache como proxy inverso.

## 📁 Estructura del Proyecto

```text
agrogestion/
├── backend/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── cultivos/
│   │   │   ├── labores/
│   │   │   ├── lotes/
│   │   │   └── usuarios/
│   │   ├── config.py
│   │   └── extensions.py
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
├── database/
│   └── init.sql
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
│       ├── admin/
│       ├── worker/
│       └── base.html
└── README.md
```
