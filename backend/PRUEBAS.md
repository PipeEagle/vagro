# Pruebas del backend AgroGestion

## Entorno

La suite está en `backend/tests/`. El fixture de `conftest.py` configura SQLite en memoria, crea las tablas de los modelos para el test y las elimina al finalizar. Las pruebas no requieren MySQL/XAMPP y no deben modificar una base local de desarrollo.

## Ejecución en Windows

Desde PowerShell, en la carpeta `backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Para obtener el detalle de cada caso:

```powershell
.\.venv\Scripts\python.exe -m pytest -v
```

Las dependencias, incluido `pytest`, ya están declaradas en `requirements.txt`; no es necesario instalarlas aparte si se usó el script de arranque.

## Cobertura actual

Los casos existentes comprueban, entre otros:

- Creación de la aplicación, conexión al SQLite de prueba y respuestas 401 de la API.
- Inicio de sesión, carga de usuarios, datos de sesión de mayordomo y redirección de la ruta antigua de dashboard a la SPA.
- Validación de campos requeridos en fincas.
- Asociación de labores con fincas y lotes existentes.
- Actualización y eliminación de lotes, y rechazo de eliminaciones con dependencias.
- Cantidad de insumos y actualización parcial de cosechas.
- Reglas de fechas para cosechas pasadas y futuras.

La última ejecución documentada en este entorno fue `17 passed` el 22 de noviembre de 2026. El total puede cambiar al agregarse pruebas.

## Límites

Esta suite es de backend y no prueba visualmente la SPA. Al usar SQLite en memoria, tampoco verifica compatibilidad del esquema MySQL/MariaDB ni sustituye una prueba manual de integración con ese motor. Las pruebas no cubren todos los endpoints ni garantizan que las rutas CRUD tengan autorización completa; revisar [CONTRATO_API.md](./CONTRATO_API.md).
