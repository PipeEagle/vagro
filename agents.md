# agents.md - AgroGestión Backend Implementation

## 📌 Contexto del Proyecto
**AgroGestión** es una plataforma web para la trazabilidad de labores agrícolas (café y plátano). 
**Estado actual:** La base de datos MySQL ya fue creada en un entorno local (XAMPP, puerto 3306) bajo el nombre `agrogestion` y contiene las tablas e iniciales definidas en el script `init.sql`.
**Objetivo de este prompt:** Configurar el núcleo del backend en Flask, e implementar los módulos de `usuarios` (autenticación) y `lotes` (consulta pública y QR), respetando estrictamente la arquitectura de Monolito Modular por Capas.

## 🏗️ Restricciones de Arquitectura (OBLIGATORIO)
El agente debe seguir estrictamente el patrón de **Monolito Modular por Capas**. Para cada módulo (`usuarios`, `lotes`), se deben crear las siguientes carpetas y archivos:
1. **`entities/`**: Modelos de SQLAlchemy. Sin lógica de negocio.
2. **`repositories/`**: Clases con métodos estáticos o de instancia para consultas a la DB. Solo acceden a la DB.
3. **`dtos/`**: Esquemas de Marshmallow para validación de entrada/salida.
4. **`services/`**: Lógica de negocio. Orquestan repositorios y validan reglas. No conocen HTTP.
5. **`controllers/`**: Blueprints de Flask. Manejan rutas, peticiones HTTP, y retornan respuestas (JSON o templates). Inyectan/usan los servicios.

**Reglas de Oro:**
- NO escribir lógica de negocio en los Controladores.
- NO escribir consultas SQL/SQLAlchemy en los Servicios (delegar al Repositorio).
- NO acceder a la base de datos directamente desde los Controladores.
- Usar *Type Hinting* y *Docstrings* en todo el código.

## 🛠️ Stack Tecnológico
- **Lenguaje:** Python 3.10+
- **Framework:** Flask
- **ORM:** Flask-SQLAlchemy
- **Validación:** Flask-Marshmallow
- **Auth:** Flask-Bcrypt, Flask-Login
- **DB:** MySQL (mysqlclient o PyMySQL)
- **Utilidades:** python-dotenv, qrcode, Pillow

---

## 📋 Tareas a Ejecutar (Paso a Paso)

### TAREA 1: Configuración del Núcleo (Core Setup)
1. **`backend/requirements.txt`**: Incluir `Flask`, `Flask-SQLAlchemy`, `Flask-Marshmallow`, `Flask-Bcrypt`, `Flask-Login`, `mysqlclient`, `python-dotenv`, `qrcode`, `Pillow`.
2. **`backend/.env`**: Crear archivo de variables de entorno.

3. **`backend/app/config.py`**: Crear clase `Config` que lea las variables de entorno y construya el `SQLALCHEMY_DATABASE_URI`.
4. **`backend/app/extensions.py`**: Inicializar extensiones globales (`db = SQLAlchemy()`, `ma = Marshmallow()`, `bcrypt = Bcrypt()`, `login_manager = LoginManager()`).
5. **`backend/app/__init__.py`**: Implementar el *App Factory* (`create_app(config_name)`). 
   - Cargar configuración.
   - Inicializar extensiones.
   - Configurar `login_manager` (login_view = 'auth.login').
   - Registrar los Blueprints de los módulos (comentados o importados condicionalmente si aún no existen, pero dejar la estructura lista).
6. **`backend/run.py`**: Punto de entrada que llama a `create_app()` y ejecuta `app.run()`.

### TAREA 2: Módulo `usuarios` (Autenticación y Admin)
*Nota: Este módulo protege las rutas del administrador.*
1. **`entities/models.py`**: Crear modelo `Usuario` mapeado a la tabla `usuarios`. Implementar métodos requeridos por Flask-Login (`is_active`, `get_id`, etc.).
2. **`repositories/user_repository.py`**: Método `get_by_username(username)`.
3. **`dtos/auth_dtos.py`**: Esquema `LoginSchema` (validar `username` y `password`).
4. **`services/auth_service.py`**: 
   - Método `authenticate(username, password)`: Busca usuario, verifica hash con bcrypt, retorna el objeto usuario o lanza excepción.
   - Configurar `user_loader` para Flask-Login.
5. **`controllers/auth_controller.py`**: 
   - Blueprint `auth_bp` (prefijo `/api/auth`).
   - Ruta `POST /login`: Valida DTO, llama al servicio, hace `login_user()`, retorna JSON de éxito.
   - Ruta `POST /logout`: Hace `logout_user()`.
   - Crear un decorador o función auxiliar `admin_required` para proteger rutas.

### TAREA 3: Módulo `lotes` (Acceso Público y QR)
*Nota: Este módulo permite al trabajador ver el lote escaneando el QR.*
1. **`entities/models.py`**: 
   - Crear modelo `Cultivo` (mapeado a `cultivos`).
   - Crear modelo `Lote` (mapeado a `lotes`), con relación `relationship` a `Cultivo`.
2. **`repositories/lote_repository.py`**: Método `get_by_qr_code(codigo_qr)`.
3. **`dtos/lote_dtos.py`**: 
   - `LotePublicSchema`: Solo expone datos seguros para el trabajador (nombre, estado, cultivo, hectáreas). NO expone IDs internos sensibles si no es necesario.
4. **`services/lote_service.py`**: 
   - Método `get_lote_details_by_qr(codigo_qr)`: Obtiene el lote, valida que exista y esté ACTIVO. Retorna el DTO.
5. **`controllers/lote_controller.py`**: 
   - Blueprint `lotes_bp` (prefijo `/api/lotes`).
   - Ruta `GET /qr/<codigo_qr>`: **PÚBLICA (Sin login)**. Llama al servicio y retorna el JSON del lote.
6. **`shared/utils/qr_generator.py`**: 
   - Función `generate_qr_base64(data)`: Genera una imagen QR usando la librería `qrcode`, la convierte a base64 y la retorna (útil para que el frontend la renderice o para imprimir los QR físicos).

### TAREA 4: Integración y Pruebas
1. Asegurar que `backend/app/__init__.py` registre correctamente `auth_bp` y `lotes_bp`.
2. Verificar que la conexión a la base de datos local (`agrogestion` en XAMPP) funcione sin errores al iniciar la app.
3. Generar un script de prueba manual o documentar en el `README.md` del backend los comandos `curl` o ejemplos de Postman para probar:
   - Login de admin.
   - Consulta pública de un lote usando el QR `LOTE-CAF-001`.

---

## ✅ Definición de Terminado (Definition of Done)
- [ ] El servidor Flask inicia sin errores (`python run.py`).
- [ ] La conexión a la base de datos MySQL local es exitosa.
- [ ] La estructura de carpetas respeta el 100% el patrón de 5 capas por módulo.
- [ ] El endpoint `/api/auth/login` acepta credenciales y devuelve un JSON.
- [ ] El endpoint `/api/lotes/qr/LOTE-CAF-001` devuelve los datos del lote en JSON sin requerir autenticación.
- [ ] No hay lógica de negocio en los controladores ni consultas SQL en los servicios.

## 💡 Instrucciones para el Agente
- Genera el código completo y funcional para cada archivo solicitado.
- Si un archivo es muy largo, divídelo lógicamente pero asegúrate de que todas las importaciones sean correctas.
- Usa manejo de excepciones personalizado (ej. crear una clase `AppException` en `shared/utils/`) para retornar códigos HTTP correctos (400, 401, 404, 500) en formato JSON.
- ¡Comienza con la TAREA 1 y procede secuencialmente!