# ROL Y MISIÓN
Actúa como un Arquitecto Frontend Senior especialista en desarrollo web estándar (Vanilla Stack) y Sistemas de Diseño. Tu misión es diseñar y construir desde cero el frontend completo de **AgroGestión**, una aplicación web tipo **SPA (Single Page Application)** para la gestión técnica, operativa y productiva de fincas agrícolas en Colombia especializadas en cultivos de **Café** y **Plátano**.

El backend ya está construido en Python (**Flask**) con base de datos relacional **MySQL** y expone una API REST. Tu responsabilidad es desarrollar exclusivamente la capa de presentación, lógica de cliente e integración con dicha API.

---

# 1. CONTEXTO DEL PROYECTO Y DOMINIO AGRÍCOLA
**AgroGestión** digitaliza el cuaderno de campo y el control administrativo de cultivos de café y plátano, permitiendo trazabilidad completa por lote desde la siembra hasta la cosecha.

- **Usuarios objetivo:** Administradores de finca, ingenieros agrónomos y mayordomos/encargados de campo (requiere una interfaz clara tanto en escritorio como en dispositivos móviles/tablets bajo luz solar).
- **Particularidades del dominio (Colombia):**
  - **Cultivos soportados:** Café (variedades como Castillo, Caturra, Colombia, Cenicafé 1), Plátano (Dominico Hartón, Hartón, Cachaco) y cultivos asociados (café intercalado con plátano).
  - **Ciclos de labores críticos:**
    1. *Fertilización:* Aplicación de fórmulas (NPK, enmiendas, abonos orgánicos), dosis por planta o hectárea según etapa fenológica.
    2. *Fumigación (Control Fitosanitario):* Manejo de plagas y enfermedades (Broca, Roya, Sigatoka Negra, Picudo), ingrediente activo, dosis y **periodo de carencia** (días mínimos que deben pasar entre la fumigación y la cosecha).
    3. *Podas y Manejo Cultural:* En café (zoqueo, descope, deschuponado, manejo de sombrío); en plátano (deshoje, deshije, destronque, embolse de racimos).
    4. *Cosechas:* Recolección periódica, clasificación de calidad (café cereza, pergamino seco, pasilla; plátano de primera, segunda, rechazo) y rendimiento por lote.
  - **Unidades de medida locales:** Kilogramos (`kg`), Arrobas (`@` = 12.5 kg), Cargas (`125 kg`), Racimos (para plátano), Hectáreas (`ha`) y Cuadras/Fanegadas (`0.64 ha`).

---

# 2. STACK TECNOLÓGICO Y RESTRICCIONES ESTRICTAS
Cumple estas reglas sin excepción:
- **PROHIBIDO** el uso de cualquier framework o librería de JS/UI (prohibido React, Vue, Angular, Svelte, Alpine.js, jQuery, HTMX, Chart.js, Moment.js, etc.).
- **TECNOLOGÍAS PERMITIDAS ÚNICAMENTE:**
  - **HTML5** semántico.
  - **CSS3** moderno (Custom Properties / Variables CSS, Flexbox, CSS Grid, `@media print`).
  - **JavaScript Vanilla (ES6+)** nativo y modular (`type="module"`), sin bundlers ni procesos de compilación obligatorios.
  - **Tailwind CSS** y **Bootstrap 5**. *(Regla de convivencia: usa Tailwind CSS como sistema principal de utilidades y layout, y emplea Bootstrap 5 únicamente para componentes interactivos puntuales como modales/dropdowns o grillas específicas, asegurando que sus resets CSS no sobrescriban los tokens de diseño propios).*

---

# 3. ARQUITECTURA SPA (SINGLE PAGE APPLICATION)
Implementa una arquitectura modular, desacoplada y mantenible en Vanilla JS:

1. **Enrutador del lado del cliente (`router.js`):**
   - Navegación fluida sin recarga de página mediante `window.history.pushState` (o enrutamiento hash `#/` como respaldo).
   - Soporte para rutas estáticas (`/dashboard`, `/lotes`, `/labores`, `/cosechas`, `/calendario`, `/insumos`), rutas dinámicas (`/lotes/:id`), guardias de autenticación (redirección a `/login` si no hay sesión) y página `404`.
2. **Gestión de Estado Reactivo (`store.js`):**
   - Implementa un patrón Observador (Pub/Sub) centralizado para manejar el estado global: usuario autenticado, finca/lotes cargados, filtros activos, caché de catálogos y cola de notificaciones.
3. **Cliente API Centralizado (`services/api.js`):**
   - Envoltorio sobre `fetch` nativo (`async/await`) con `BASE_URL` configurable.
   - Inyección automática de headers de autorización (`Authorization: Bearer <token>`), manejo estandarizado de errores HTTP (`400`, `401`, `403`, `404`, `500`) y un interruptor `USE_MOCK_DATA` con datos realistas de prueba para operar de inmediato mientras se conectan los endpoints reales de Flask.
4. **Estructura de Archivos:**
   ```text
   /frontend
   ├── index.html                 # Shell principal de la SPA
   ├── css/
   │   ├── tokens.css             # Variables del Design System
   │   ├── base.css               # Estilos base, tipografía y reglas @media print
   │   └── components.css         # Estilos de componentes UI reutilizables
   └── js/
       ├── app.js                 # Inicialización y montaje del layout
       ├── router.js              # Motor de rutas SPA
       ├── store.js               # Estado global (Pub/Sub)
       ├── services/
       │   └── api.js             # Cliente HTTP para Flask + capa Mock
       ├── utils/
       │   ├── validators.js      # Validaciones de formularios y reglas agronómicas
       │   ├── converters.js      # Conversores de unidades (@, kg, cargas, ha, cuadras)
       │   └── exporters.js       # Generador nativo de archivos CSV y reportes
       ├── components/            # Componentes UI (Sidebar, Navbar, Modal, Toast, Table, KpiCard)
       └── views/                 # Vistas de página (Login, Dashboard, Lotes, LoteDetalle, Labores, Cosechas, Calendario, Insumos)

       4. REGLAS DEL SISTEMA DE DISEÑO (DESIGN SYSTEM)
Todo el frontend debe regirse por un sistema de diseño estricto y documentado en código:

Design Tokens (tokens.css):

Define en :root todas las variables globales. Prohibido usar colores hexadecimales o tamaños arbitrarios dispersos en el CSS/HTML.

Paleta de color: Primarios inspirados en cafetales y follaje (--color-primary: verde bosque profundo, --color-secondary: tono tierra/café tostado), superficies neutras de alto contraste (--bg-canvas, --bg-surface), y colores semánticos estrictos por tipo de labor/estado:

Fertilización: Azul/Cian técnico (--color-labor-fertilizacion)

Fumigación: Ámbar/Naranja preventivo (--color-labor-fumigacion)

Podas: Verde oliva/esmeralda (--color-labor-poda)

Cosecha: Terracota/Rojo cereza madura (--color-labor-cosecha)

Estados: --color-success, --color-warning, --color-danger, --color-info.

Tipografía: Escala modular (--text-xs a --text-3xl) y uso obligatorio de font-variant-numeric: tabular-nums en todas las tablas, precios, dosis y pesajes.

Espaciado, Radios y Elevación: Escala estricta en múltiplos de 4px/8px, bordes redondeados consistentes y sombras sutiles.

Componentes UI Reutilizables:

Crea módulos JS puros que rendericen elementos consistentes: KpiCard, DataTable (con ordenamiento y paginación), StatusBadge, ModalDialog, DrawerPanel, ToastNotification y ConfirmDialog.

4 Estados Obligatorios por Vista:

Toda vista conectada a la API debe gestionar explícitamente: Cargando (Skeleton loaders), Con Datos, Vacío (ilustración/icono + mensaje claro + botón de acción primaria) y Error (alerta con detalle y botón "Reintentar").

Ergonomía de Campo y Accesibilidad:

Diseño Mobile-First con botones e inputs de mínimo 44px de alto para uso táctil con una mano.

Contraste mínimo WCAG AA (legible en exteriores).

HTML semántico (nav, main, section, header, article) y atributos aria-live="polite" para alertas y cambios de vista SPA.

5. MÓDULOS, FUNCIONES Y ACCIONES DEL SISTEMA
Implementa las siguientes capacidades funcionales completas:

Autenticación y Sesión:

Inicio de sesión con validación de credenciales contra Flask.

Cierre de sesión seguro, manejo de expiración de token y visualización del perfil/rol del usuario activo.

Dashboard Operativo:

KPIs principales: Total de hectáreas activas (desglosadas en Café y Plátano), Labores pendientes de la semana, Labores vencidas (alerta roja) y Producción acumulada del mes (en kg y @).

Visualización nativa: Gráficos de barras/líneas construidos con <canvas> o <svg> nativo en Vanilla JS mostrando rendimiento de cosecha por lote y distribución de labores realizadas.

Panel de acción rápida: Lista de tareas prioritarias de hoy con botón directo para marcar como "Completada".

Gestión de Lotes y Cultivos (/lotes y /lotes/:id):

Acciones CRUD: Crear, editar, consultar y desactivar/eliminar lotes.

Ficha técnica del lote: Nombre/código del lote, tipo de cultivo (Café, Plátano, Asociado), variedad, área (ha), cantidad de árboles/matas, fecha de siembra y estado fenológico (Levante, Producción, Zoqueo).

Vista de Detalle (/lotes/:id): KPIs individuales del lote + Línea de tiempo (Timeline) cronológica con todas las fertilizaciones, fumigaciones, podas y cosechas ejecutadas en ese lote.

Control Integral de Labores Agrícolas (/labores):

Gestión de ciclos: Registrar nuevas labores (programadas o ya ejecutadas), editar registros y eliminar con confirmación.

Flujo de estados: Cambiar estado de labor (Programada → En ejecución → Completada → Cancelada) con actualización instantánea en UI.

Acción Masiva (Batch Action): Permitir seleccionar múltiples lotes mediante checkboxes y programar o registrar una misma labor (ej. Fertilización general) para todos a la vez.

Filtros combinados: Filtrar por Lote, Cultivo, Tipo de Labor, Estado y Rango de Fechas.

Control de Cosechas y Rendimiento (/cosechas):

Registro rápido de recolección por lote, fecha, cantidad recolectada, unidad de entrada (kg, @, cargas, racimos) y clasificación de calidad.

Validación agronómica automática (Alerta de Carencia): Si un lote tuvo una fumigación reciente cuyo periodo de carencia aún no se cumple, mostrar una advertencia visual bloqueante o de confirmación antes de registrar una cosecha en ese lote.

Catálogo de Insumos y Dosis (/insumos):

Gestión básica de fertilizantes, fungicidas/insecticidas y enmiendas (nombre comercial, ingrediente activo, tipo, periodo de carencia en días y unidad de medida) para vincularlos fácilmente al registrar labores.

6. HERRAMIENTAS INTEGRADAS EN EL FRONTEND
Incluye estas herramientas utilitarias dentro de la interfaz para potenciar el trabajo diario:

Calendario Agronómico Interactivo (/calendario):

Vista mensual y semanal construida 100% en Vanilla JS que muestra las labores programadas, vencidas y cosechas mediante etiquetas de color. Permite hacer clic en un día para agendar una labor o sobre un evento para ver su detalle/completarlo.

Calculadoras Agronómicas (Modal/Drawer accesible desde el Navbar):

Conversor de Unidades Agrícolas: Conversión instantánea entre Kilogramos (kg), Arrobas (@), Cargas (125 kg), Hectáreas (ha) y Cuadras (6,400 m²).

Calculadora de Dosis por Lote: Al ingresar dosis por planta/árbol (ej. 80 gramos/árbol) y seleccionar un lote, calcula automáticamente el total de bultos o litros necesarios según el número de plantas registradas en ese lote.

Exportador de Reportes y Bitácora Imprimible:

Botón "Exportar CSV" en las vistas de Labores y Cosechas que descarga en el navegador un archivo .csv (codificado en UTF-8 con BOM para abrir correctamente en Excel) con los datos filtrados actualmente.

Botón "Imprimir / Guardar PDF" que activa una hoja de estilos @media print limpia (ocultando sidebar, botones y filtros, dejando solo encabezado de finca y tabla de trazabilidad).

Buscador Global Rápido:

Barra de búsqueda en el header (con atajo de teclado /) que filtra instantáneamente lotes, labores recientes o insumos desde el estado en memoria.

Resiliencia de Borradores en Campo:

Autoguardado temporal en localStorage mientras se diligencia el formulario de registro de labor o cosecha, recuperando los datos si el navegador se cierra o se pierde conexión momentáneamente en el lote.

7. PROTOCOLO DE EJECUCIÓN
Procede en este orden estricto:

Confirmación de API: Antes de finalizar services/api.js, pregúntame por las rutas/endpoints exactos de mi backend en Flask y sus estructuras JSON de entrada/salida. Mientras te los comparto, deja completamente funcional el modo USE_MOCK_DATA = true con datos realistas de café y plátano para que toda la SPA sea navegable e interactiva desde el primer momento.

Entrega Incremental:

Fase 1: Crea index.html, tokens.css, base.css y components.css estableciendo el sistema de diseño completo.

Fase 2: Construye store.js, router.js, services/api.js, utils/ y el layout principal (Sidebar colapsable + Topbar con buscador y acceso a calculadoras).

Fase 3: Implementa las vistas funcionales (Dashboard, Lotes, LoteDetalle, Labores, Cosechas, Calendario, Insumos, Login) con todos sus estados y acciones.

Calidad: Escribe código limpio, modular, bien estructurado, sin dependencias ocultas y listo para ejecutarse con cualquier servidor estático local (Live Server, python -m http.server, etc.).