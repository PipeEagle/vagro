# Guion técnico del video: Frontend y Backend de AgroGestion

**Alcance:** solo explicación técnica del Frontend y Backend.  
**Duración sugerida:** 12–15 minutos.  
**Archivo final:** `Video_Proyecto_Final_AgroGestion.mp4`.

> Los números de línea indicados corresponden al código actual y pueden cambiar. En VS Code, abrir el archivo y pulsar `Ctrl+G` para saltar a una línea. Reemplacen los nombres entre corchetes. Distribuyan las secciones para que todas las personas participen.

## Preparación

- Abrir el proyecto real en VS Code, preferiblemente con las carpetas `frontend/spa/` y `backend/app/` visibles.
- Tener listos `docs/arquitectura.drawio` y `docs/flujo-api.drawio` para relacionarlos brevemente con el flujo de código.
- Usar datos ficticios. No mostrar `backend/.env`, contraseñas, cookies, tokens ni claves.
- Si se muestra la aplicación o Network, usar una cuenta de prueba y ocultar los encabezados de sesión.
- No afirmar que todo endpoint está protegido: el CRUD de usuarios sí exige administrador, pero los otros CRUD no tienen autorización uniforme.
- No afirmar que Flask-Migrate administra actualmente la base: la dependencia está instalada, pero no se inicializa en la aplicación.

## Apertura técnica — 0:00 a 0:20

**[Integrante 1]**

> “En esta parte explicaremos cómo están organizados el Frontend y el Backend de AgroGestion. Después seguiremos una operación concreta —crear una labor— desde el formulario hasta su persistencia, señalando los archivos y las líneas importantes.”

## 1. Explicación técnica del Frontend — 0:20 a 5:40

### 1.1 Estructura y entrada de la SPA

**[Integrante 1 comparte VS Code y abre `frontend/spa/`]**

> “El Frontend está dentro de `frontend/spa/`. No tiene un proceso de compilación: Flask sirve el HTML y los archivos JavaScript y CSS. La entrada es `index.html`; las vistas, componentes y servicios están separados dentro de `js/`.”

**Mostrar `frontend/spa/index.html`, líneas 8–18:**

- Líneas 9–12 cargan Bootstrap y los estilos propios: tokens, estilos base y componentes.
- Línea 16 contiene el elemento `#app`, donde se monta la aplicación.
- Línea 18 carga `js/app.js` como módulo JavaScript.

> “El HTML inicial es deliberadamente pequeño. JavaScript genera el navbar y la vista que se muestra dentro de `#app`.”

**Mostrar el árbol de `frontend/spa/js/`:**

- `app.js`: punto de entrada, selección de vistas y comprobación de sesión en el cliente.
- `router.js`: navegación del lado del cliente.
- `store.js`: estado compartido.
- `services/api.js`: cliente HTTP.
- `components/`: elementos reutilizables como navbar, modal y badges.
- `views/`: pantallas y detalles de cada módulo.

### 1.2 Enrutamiento y renderizado

**[Integrante 2 abre `frontend/spa/js/app.js` y `router.js`]**

> “`app.js` importa las vistas y decide cuál renderizar según la ruta. Por ejemplo, registra `/labores` y `/labores/:id` en las líneas 299–321 y, al iniciar, conecta el router con el renderizado actual.”

**Mostrar `frontend/spa/js/router.js`:**

- Líneas 10–23: `matchRoute` compara la ruta solicitada y extrae parámetros, como el identificador de `/labores/12`.
- Líneas 26–29: convierte una ruta con parámetros en una expresión regular.
- Líneas 31–34: `navigateTo` cambia la URL con `history.pushState` sin recargar el documento.
- Líneas 36–42: escucha el botón Atrás/Adelante del navegador (`popstate`).
- Líneas 44–52: delega los clics sobre enlaces `a[data-router]` para navegar dentro de la SPA.

> “El evento se escucha una sola vez en `document`; así los enlaces creados dinámicamente también se pueden manejar. Después del cambio de ruta, `app.js` vuelve a renderizar el contenido.”

**Mostrar `frontend/spa/js/app.js`, líneas 61–69 y 71–168:**

> “`requireAuth` comprueba si la interfaz considera que existe una sesión y redirige a Login si no. Esta es una barrera de navegación del cliente, no reemplaza la autorización que debe aplicar el servidor.”

### 1.3 Store y actualización de vistas

**[Integrante 2 abre `frontend/spa/js/store.js`]**

> “El store mantiene datos compartidos, como usuario, fincas, lotes y labores. `getState`, alrededor de la línea 24, permite consultar el estado. `setState`, líneas 38–41, combina los cambios con el estado anterior y notifica a los suscriptores. También expone `subscribe` para observar cambios.”

> “Al cargar la SPA, `app.js`, líneas 235–270, solicita datos iniciales a la API; luego, alrededor de la línea 273, consulta `/api/auth/me` para recuperar la sesión existente. Cuando una vista crea un registro, actualiza el store para que la interfaz lo muestre sin reconstruir todo el sitio.”

### 1.4 Componentes, DOM y eventos

**[Integrante 3 abre `frontend/spa/js/components/`]**

> “Las funciones de `components/` generan elementos de interfaz reutilizables. `Navbar` construye la navegación; `Modal` concentra la lógica de confirmación; `StatusBadge` representa estados; y `KpiCard` muestra indicadores.”

**Mostrar `components/modal.js`, líneas 59–79:**

> “El modal escucha el clic en Confirmar, valida el formulario con `reportValidity`, deshabilita temporalmente el botón y espera el callback `onConfirm`. Si el callback devuelve `false`, el modal permanece abierto para que se pueda corregir el error.”

**Mostrar `frontend/spa/js/views/labores.js`, líneas 26–27 y 73–80:**

> “La vista construye la tabla con `innerHTML`. Después agrega un listener al `tbody`; al hacer clic, busca la fila con `data-labor-id`, obtiene el ID y navega al detalle. Es un ejemplo de manipulación del DOM y delegación de eventos.”

### 1.5 API, validaciones y errores

**[Integrante 3 abre `frontend/spa/js/services/api.js`]**

> “Todas las vistas usan `apiClient`, que centraliza las solicitudes con `fetch`. Las líneas 14–25 preparan el método, la ruta, el JSON y las credenciales de mismo origen, necesarias para enviar la cookie de sesión.”

> “La línea 33 realiza el `fetch`. Si recibe 401, alrededor de las líneas 37–45, limpia el usuario del store. Las líneas 52–55 transforman una respuesta HTTP no exitosa en un error con su mensaje. Las líneas 64–67 reintentan hasta tres veces algunos errores de red o del servidor.”

**Mostrar `frontend/spa/js/app.js`, líneas 50–58, y `views/labores.js`, líneas 143–151:**

> “La validación del cliente comprueba campos vacíos y que la fecha de la labor no sea anterior a hoy. El modal también usa la validación nativa del navegador. Estas verificaciones mejoran la experiencia, pero los datos se vuelven a validar en el Backend.”

**Cierre de la sección frontend:**

> “En resumen, la vista recoge los datos y maneja eventos; el router decide qué pantalla mostrar; el store conserva el estado de trabajo; y el servicio API concentra la comunicación con Flask.”

## 2. Explicación técnica del Backend — 5:40 a 12:50

### 2.1 Estructura, fábrica y dominios

**[Integrante 3 o 4 abre `backend/` en VS Code]**

> “El Backend es un monolito modular Flask. En `app/modules/` se organizan los dominios de usuarios, fincas, cultivos, lotes, labores, cosechas, insumos y eventos. Cada módulo separa controladores, DTO, servicios, repositorios y entidades.”

**Mostrar `backend/app/__init__.py`:**

- Líneas 33–46: `create_app` crea Flask, carga la configuración e inicializa SQLAlchemy, Marshmallow, BCrypt y Flask-Login.
- Líneas 55–64: registra los blueprints de autenticación y de los distintos dominios.
- Líneas 66–84: sirve la SPA y sus recursos estáticos propios desde `frontend/spa/`.
- Líneas 101–110: convierte excepciones de aplicación y errores HTTP en respuestas JSON para la API.

> “La fábrica permite crear la aplicación con distintas configuraciones; por ejemplo, los tests reemplazan MySQL por una base SQLite en memoria.”

### 2.2 Endpoints de la API REST

**[Integrante 4 señala las rutas en `backend/app/modules/*/controllers/`]**

> “Cada dominio registra un Blueprint con su prefijo `/api`. Los endpoints de sesión están en `/api/auth`: Login, Logout y consulta de la sesión actual. La consulta pública por QR está en `/api/lotes/qr/<codigo_qr>` y también hay una ruta para obtener la imagen del QR.”

> “Los módulos de usuarios, fincas, cultivos, lotes, labores, cosechas, insumos y eventos ofrecen rutas de colección y por identificador. En general, la colección usa GET para listar y POST para crear; la ruta con ID usa GET, PUT y DELETE. Los controladores transforman las solicitudes y respuestas JSON y asignan los códigos HTTP: por ejemplo, 201 al crear, 400 al validar datos y 404 cuando no se encuentra el registro.”

> “Las rutas están distribuidas por dominio, no en un único controlador gigante. Ahora veamos con más detalle el endpoint `POST /api/labores`.”

### 2.3 Recorrido completo: crear una labor

**[Integrante 4 comparte código siguiendo este orden]**

> “Usaremos la creación de una labor para recorrer el flujo completo desde el navegador hasta la base de datos.”

#### Paso 1: la vista envía la solicitud

**Abrir `frontend/spa/js/views/labores.js`, líneas 143–167.**

> “El callback del modal lee el formulario y valida los campos requeridos. Después reúne `finca_id`, `lote_id`, tipo, fecha y estado, y llama a `apiClient.post('/api/labores', ...)`.”

#### Paso 2: el controlador recibe JSON

**Abrir `backend/app/modules/labores/controllers/labor_controller.py`, líneas 34–57.**

> “La ruta `POST /api/labores` obtiene el cuerpo JSON. Si el cuerpo no es un objeto válido, responde 400. Si el DTO rechaza los datos, devuelve el error de validación. Si las reglas de negocio aceptan la operación, serializa el resultado y responde 201, que indica que se creó un recurso.”

#### Paso 3: el DTO valida la forma de los datos

**Abrir `backend/app/modules/labores/dtos/labor_dtos.py`, líneas 39–60.**

> “`LaborCreateSchema` comprueba que estén los identificadores de finca y lote, que el tipo pertenezca a la lista permitida y que la fecha tenga formato válido. También valida los estados permitidos. El DTO verifica la forma de la solicitud; todavía no comprueba por sí solo que el lote pertenezca a esa finca.”

#### Paso 4: el servicio aplica reglas de negocio

**Abrir `backend/app/modules/labores/services/labor_service.py`, líneas 39–69.**

> “`LaborService.create` valida los tipos y estados admitidos, comprueba que existan la finca y el lote, y verifica que el lote corresponda a la finca seleccionada. Si una regla falla, lanza `AppException` con un mensaje y un código HTTP.”

#### Paso 5: el repositorio persiste

**Abrir `backend/app/modules/labores/repositories/labor_repository.py`, líneas 38–61.**

> “El repositorio crea el objeto `Labor`, lo agrega a la sesión de SQLAlchemy y ejecuta `commit`. Aquí se concentra la persistencia, en vez de escribir consultas de base de datos en el controlador o el servicio.”

#### Paso 6: el modelo representa la entidad

**Abrir `backend/app/modules/labores/entities/models.py`, líneas 10–42.**

> “El modelo declara la tabla `labores`, sus campos, claves foráneas a finca y lote, y relaciones ORM. SQLAlchemy convierte el objeto Python en operaciones sobre la base de datos.”

#### Paso 7: respuesta y actualización visual

> “El controlador devuelve el registro serializado con HTTP 201. `apiClient` entrega el JSON a la vista; esta agrega la labor al store y vuelve a dibujar la tabla. Luego intenta registrar un evento para el calendario. Si falla esa segunda solicitud, muestra una advertencia, pero conserva la labor ya creada.”

**Relacionar con arquitectura:** mostrar `docs/arquitectura.drawio` y señalar las cajas controller → service → repository → entity. Explicar que este recorrido concreto corresponde a esa separación.

### 2.4 Autenticación, permisos y errores

**[Integrante 4]**

**Mostrar `backend/app/modules/usuarios/controllers/auth_controller.py`, líneas 29–40 y 60–80:**

> “El decorador `admin_required` comprueba sesión y rol administrador. La ruta de Login valida la entrada, delega la autenticación al servicio y crea la sesión con Flask-Login. `AuthService.authenticate`, en `usuarios/services/auth_service.py`, consulta el usuario, comprueba que esté activo y verifica la contraseña con BCrypt; nunca devuelve el hash.”

**Mostrar `backend/app/modules/usuarios/controllers/user_controller.py`, líneas 19–22 y 40–43:**

> “Las rutas de consulta y alta de usuarios usan `login_required` y `admin_required`. La consulta QR de lotes es pública. En cambio, los otros CRUD no tienen una protección uniforme en el estado actual. La protección de rutas en el navegador no debe confundirse con autorización del servidor.”

**Mostrar `backend/app/shared/utils/app_exception.py`, líneas 4–11, y `backend/app/__init__.py`, líneas 101–110:**

> “`AppException` transporta un mensaje entendible y un código de estado. El manejador de Flask lo convierte en JSON. Para una ruta API, los errores HTTP también se devuelven como JSON; por ejemplo, 400 para datos inválidos, 401 para falta de sesión en una ruta protegida y 404 para un recurso inexistente.”

### 2.5 Configuración, base de datos y migraciones

**[Integrante 4]**

**Mostrar `backend/app/config.py`, líneas 10–21:**

> “La configuración carga `backend/.env` y construye la conexión `mysql+pymysql` a partir de las variables de entorno. No mostraremos el archivo `.env`, porque contiene secretos y datos de conexión.”

> “Los tests usan `TestConfig` en `backend/tests/conftest.py`, líneas 9–14, que configura SQLite en memoria. Esto aísla las pruebas de la base MySQL local, pero no demuestra que el DDL instalado sea compatible.”

> “Flask-Migrate está declarado como dependencia, pero no se inicializa en la fábrica; la aplicación tampoco crea las tablas al arrancar. Además, el SQL de inicialización no coincide completamente con los modelos. Por eso se debe comparar y probar el esquema antes de una instalación nueva o un despliegue.”

### 2.6 Cierre técnico — 12:50 a 13:20

**[Todos los integrantes, una frase por persona]**

> “[Nombre]: En el Frontend vimos cómo las vistas, el router, el store y el cliente API se coordinan.”
>
> “[Nombre]: En el Backend seguimos una solicitud por controlador, DTO, servicio, repositorio y modelo.”
>
> “[Nombre]: También señalamos qué validaciones y permisos están realmente aplicados.”
>
> “[Nombre]: Con esto relacionamos la implementación con la arquitectura y dejamos claros los aspectos pendientes.”

## Lista de control para grabar

- Todas las personas explican alguna parte técnica y se escucha claramente cada voz.
- Se muestran archivos reales en VS Code y se usan las líneas como guía, no se lee código de principio a fin.
- La explicación sigue al menos un flujo completo desde la pantalla hasta la persistencia y la respuesta.
- No se presentan como completas las migraciones ni la autorización de todos los endpoints.
- No aparecen credenciales, `.env`, cookies, tokens, claves ni datos reales.
