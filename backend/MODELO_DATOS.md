# Modelo de datos AgroGestion

Este documento describe los modelos ORM que usa actualmente la aplicación. No sustituye una inspección del esquema instalado en MySQL: el esquema SQL y los modelos no están completamente alineados.

## Entidades ORM

| Entidad / tabla | Campos principales | Relaciones declaradas en ORM |
|---|---|---|
| `Usuario` / `usuarios` | `username` único, `password_hash`, `nombre_completo`, `rol`, `finca_id` opcional, `is_active`, `created_at`, `updated_at` | `finca_id` referencia `fincas.id` |
| `Finca` / `fincas` | `nombre`, `municipio`, `departamento`, `estado`, `creado_en`, `actualizado_en` | Relacionada mediante `backref` con lotes y labores |
| `Cultivo` / `cultivos` | `nombre` único, `descripcion`, `ciclo_estimado_dias`, `creado_en`, `actualizado_en` | Un cultivo puede tener lotes |
| `Lote` / `lotes` | `finca_id`, `cultivo_id`, `codigo_qr` único, `nombre`, `hectareas`, `estado`, `fecha_siembra`, `estado_fenologico`, `arboles`, `ubicacion_gps`, timestamps | FKs a `fincas.id` y `cultivos.id` |
| `Labor` / `labores` | `finca_id`, `lote_id`, `tipo`, `fecha`, `estado`, `insumo`, `dosis`, `observaciones`, timestamps | FKs a `fincas.id` y `lotes.id` |
| `Cosecha` / `cosechas` | `finca_id`, `lote_codigo_qr`, `fecha`, `cantidad`, `unidad`, `calidad`, `estado`, timestamps | No declara FKs en el modelo actual |
| `Insumo` / `insumos` | `finca_id`, `nombre`, `tipo`, `ingrediente`, `carencia`, `cantidad`, `unidad`, timestamps | No declara FKs en el modelo actual |
| `Evento` / `eventos` | `finca_id`, `fecha`, `titulo`, `tipo`, `estado`, timestamps | No declara FKs en el modelo actual |

Roles contemplados por la autenticación y la interfaz: `ADMIN`, `SUPERADMIN` y `MAYORDOMO`. Los estados de lotes son `ACTIVO`, `EN_DESCANSO` y `FINALIZADO`.

## Relaciones principales

```text
Finca 1:N Usuario (asignación opcional)
Finca 1:N Lote
Finca 1:N Labor
Cultivo 1:N Lote
Lote 1:N Labor
```

`Cosecha`, `Insumo` y `Evento` incluyen un `finca_id` de dominio, pero sus modelos no declaran una relación ORM/FK. No asumir integridad referencial en esas asociaciones.

## Diferencias conocidas con el SQL de inicialización

`database/init.sql` no debe tratarse como representación exacta de los modelos actuales ni ejecutarse sin revisión. Entre otras diferencias, el SQL de usuarios define columnas de estado y fechas distintas a `Usuario`, su enum de rol incluye `MAYORDOMO` mientras que el enum ORM actual no lo incluye, y las claves de finca de lotes/labores no corresponden a las FKs que declaran los modelos. El orden de creación también debe revisarse.

Antes de crear una base desde cero o actualizar una base existente:

1. Compara los modelos en `backend/app/modules/*/entities/models.py` con el esquema MySQL real.
2. Corrige y revisa el DDL con una copia de seguridad; no apliques cambios destructivos sobre datos reales.
3. Prueba la aplicación y sus relaciones en una base aislada.

La aplicación no crea tablas ni sincroniza el esquema al arrancar. La suite automatizada usa SQLite en memoria; no demuestra que el esquema MySQL esté sincronizado.
