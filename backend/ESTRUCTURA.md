# Estructura del Backend - AgroGestion

Documento de estructura técnica del backend, siguiendo el patrón de monolito modular por capas.

## Árbol de directorios

```
backend/
├── app/
│   ├── __init__.py          # Application Factory create_app()
│   ├── config.py            # Configuración desde variables de entorno
│   ├── extensions.py        # db, ma, bcrypt, login_manager
│   ├── modules/
│   │   ├── __init__.py
│   │   ├── usuarios/        # Dominio: autenticación y administradores
│   │   │   ├── __init__.py
│   │   │   ├── entities/
│   │   │   │   ├── __init__.py
│   │   │   │   └── models.py     # Usuario (ORM)
│   │   │   ├── repositories/
│   │   │   │   ├── __init__.py
│   │   │   │   └── user_repository.py  # get_by_username, get_by_id
│   │   │   ├── dtos/
│   │   │   │   ├── __init__.py
│   │   │   │   └── auth_dtos.py   # LoginSchema (Marshmallow)
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   └── auth_service.py # authenticate(), load_user()
│   │   │   ├── controllers/
│   │   │   │   ├── __init__.py
│   │   │   │   └── auth_controller.py  # auth_bp, auth_pages_bp, admin_required
│   │   │   └── README.md
│   │   ├── lotes/           # Dominio: consulta pública de lotes por QR
│   │   │   ├── __init__.py
│   │   │   ├── entities/
│   │   │   │   ├── __init__.py
│   │   │   │   └── models.py     # Cultivo, Lote (ORM con relación)
│   │   │   ├── repositories/
│   │   │   │   ├── __init__.py
│   │   │   │   └── lote_repository.py  # get_by_qr_code
│   │   │   ├── dtos/
│   │   │   │   ├── __init__.py
│   │   │   │   └── lote_dtos.py   # LotePublicSchema, CultivoPublicSchema
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   └── lote_service.py # get_lote_details_by_qr
│   │   │   ├── controllers/
│   │   │   │   ├── __init__.py
│   │   │   │   └── lote_controller.py  # lotes_bp, GET /api/lotes/qr/:codigo_qr
│   │   │   └── README.md
│   │   ├── cultivos/        # Dominio: catálogo de cultivos (pendiente implementar)
│   │   │   ├── __init__.py
│   │   │   ├── entities/__init__.py
│   │   │   ├── repositories/__init__.py
│   │   │   ├── dtos/__init__.py
│   │   │   ├── services/__init__.py
│   │   │   └── controllers/__init__.py
│   │   └── labores/         # Dominio: registro y verificación de labores (pendiente)
│   │       ├── __init__.py
│   │       ├── entities/__init__.py
│   │       ├── repositories/__init__.py
│   │       ├── dtos/__init__.py
│   │       ├── services/__init__.py
│   │       └── controllers/__init__.py
│   ├── compartido/          # Utilidades transversales (app/compartido)
│   │   ├── __init__.py
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── app_exception.py   # AppException (errores HTTP JSON)
│   │   │   └── qr_generator.py    # generate_qr_base64()
│   │   ├── middleware/
│   │   │   └── __init__.py
│   │   └── constants.py     # LABOR_TYPES
│   └── README.md
├── migrations/              # Migraciones Flask-Migrate/Alembic (versiones versionadas)
├── scripts/
│   ├── crear_base_datos.sql # Script DDL para crear BD agrogestion (no tablas)
│   └── crear_admin.py       # Script manual para crear primer administrador
├── tests/                   # Pruebas pytest por dominio
├── storage/                 # Persistencia de archivos no versionada (QR, etc.)
├── .env                     # Variables de entorno (NO versionar)
├── .env.example             # Plantilla de variables de entorno
├── requirements.txt         # Dependencias Python
├── run.py                   # Punto de entrada
└── ESTRUCTURA.md            # Este documento
```

## Reglas de responsabilidad por capa

| Capa | Archivos típicos | Responsabilidad |
|------|-----------------|-----------------|
| Controlador | `controlador.py` | Rutas HTTP, Blueprints, interpretar petición, retornar respuestas JSON/templates |
| Esquemas (DTOs) | `esquemas.py` | Validación y serialización de entrada/salida con Marshmallow |
| Servicio | `servicio.py` | Reglas de negocio, permisos, transacciones, orquestar repositorios |
| Repositorio | `repositorio.py` | Consultas SQLAlchemy/ORM, acceso directo a base de datos |
| Modelo | `modelos.py` | Declaración de tablas, restricciones ORM, relaciones |
| Compartido | `errores.py`, `seguridad.py`, `respuestas.py` | Excepciones, utilidades de seguridad, respuestas uniformes |

## Convenciones

- **No lógica de negocio en controladores** — delegar al servicio
- **No consultas SQL/SQLAlchemy en servicios** — delegar al repositorio
- **No acceso directo a BD desde controladores** — usar repositorio → servicio
- **No crear carpetas o clases vacías** — solo agregar cuando se implemente funcionalidad
- **Dominios independientes** — `usuarios`, `lotes`, `cultivos`, `labores` no se importan entre sí salvo a través de `app/compartido` o `app.extensions`
