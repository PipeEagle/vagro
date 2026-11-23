# Estructura del proyecto AgroGestion

## Raíz

```text
agrogestion/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── modules/
│   │   │   ├── usuarios/
│   │   │   ├── fincas/
│   │   │   ├── cultivos/
│   │   │   ├── lotes/
│   │   │   ├── labores/
│   │   │   ├── cosechas/
│   │   │   ├── insumos/
│   │   │   └── eventos/
│   │   └── shared/
│   │       ├── constants.py
│   │       ├── middleware/
│   │       └── utils/
│   ├── scripts/
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
├── database/
│   ├── init.sql
│   └── migrations/
├── frontend/
│   └── spa/
│       ├── index.html
│       ├── css/
│       └── js/
├── iniciar.ps1
└── arranque.txt
```

Cada dominio bajo `app/modules/` organiza su implementación en `controllers/`, `dtos/`, `entities/`, `repositories/` y `services/`. Los módulos registrados en la fábrica de Flask cubren usuarios, fincas, cultivos, lotes, labores, cosechas, insumos y eventos.

## Responsabilidades

| Capa | Responsabilidad |
|---|---|
| Controllers | Rutas HTTP, validación de la petición y respuesta |
| DTOs | Validación y serialización de datos |
| Services | Reglas de negocio y coordinación del dominio |
| Repositories | Consultas y persistencia con SQLAlchemy |
| Entities | Modelos ORM |
| `shared/` | Excepciones, constantes y utilidades comunes |

La aplicación se crea con `create_app()` en `app/__init__.py`. `run.py` es el punto de entrada local. La SPA se sirve desde `frontend/spa/`; no existen dependencias en `frontend/static/` ni `frontend/templates/`.

## Base de datos y pruebas

La configuración local se carga desde `backend/.env`; nunca se debe versionar ese archivo. La aplicación no crea el esquema al arrancar. Aunque `Flask-Migrate` está en las dependencias, no está inicializado en la fábrica actual. Consulta [MIGRACIONES.md](./MIGRACIONES.md) antes de modificar el esquema.

Los tests de `backend/tests/` crean el esquema en SQLite en memoria para no tocar MySQL local.
