# ROL Y OBJETIVO
Actúa como un Arquitecto Frontend Senior especialista en desarrollo web estándar y Sistemas de Diseño. Tu objetivo es diseñar y construir desde cero el frontend completo de **AgroGestión**, una aplicación web tipo **SPA (Single Page Application)** para la gestión y seguimiento técnico de cultivos de café y plátano (control de lotes, fertilización, fumigación, podas y cosechas).

El backend ya está desarrollado en Python con **Flask** y expone una API REST conectada a MySQL. Tu trabajo es construir únicamente la capa de presentación e integración con dicha API.

---

# 1. STACK TECNOLÓGICO Y RESTRICCIONES ESTRICTAS
Debes cumplir estas reglas sin excepción:
- **PROHIBIDO** el uso de cualquier framework o librería de UI/JS (nada de React, Vue, Angular, Svelte, Alpine.js, jQuery ni HTMX).
- **TECNOLOGÍAS PERMITIDAS ÚNICAMENTE:**
  - **HTML5** semántico.
  - **CSS3** moderno (Variables CSS / Custom Properties, Flexbox, CSS Grid).
  - **JavaScript Vanilla (ES6+)** modular (`type="module"`), sin procesos de compilación complejos obligatorios.
  - **Tailwind CSS** y/o **Bootstrap 5** para utilidades y grillas responsivas. *(Nota de implementación: si utilizas ambos, define Tailwind como sistema principal de utilidades y usa Bootstrap únicamente de forma aislada o con prefijos para evitar colisiones de clases como `.container`, `.btn` o `.collapse`)*.

---

# 2. ARQUITECTURA SPA (SINGLE PAGE APPLICATION)
Implementa una arquitectura limpia, desacoplada y escalable en Vanilla JS:

1. **Enrutamiento del lado del cliente (Client-Side Router):**
   - Implementa un router propio basado en `window.history.pushState` (o manejo de rutas por hash `#/`) que intercepte la navegación sin recargar el navegador.
   - Renderiza las vistas dinámicamente dentro de un contenedor principal (`#app-view`), gestionando rutas protegidas, parámetros dinámicos (ej. `/lotes/:id`) y una vista `404` personalizada.
2. **Gestión de Estado Centralizada:**
   - Crea un `Store` ligero basado en el patrón Observador (Pub/Sub) para mantener sincronizado el estado global (usuario autenticado, lista de lotes, filtros activos, notificaciones) sin depender de variables globales dispersas.
3. **Capa de Servicios (API Client):**
   - Centraliza todas las peticiones HTTP en un módulo `api.js` usando `fetch` nativo y `async/await`.
   - Incluye interceptores manuales para inyectar tokens de autenticación (JWT/Headers), manejar errores HTTP de forma uniforme (401, 403, 404, 500) y configurar fácilmente la `BASE_URL` del servidor Flask.
4. **Estructura de Directorios Sugerida:**
   ```text
   /frontend
   ├── index.html              # Shell principal de la SPA
   ├── css/
   │   ├── tokens.css          # Variables del Design System (colores, fuentes, espaciado)
   │   ├── base.css            # Resets y estilos globales
   │   └── components.css      # Estilos de componentes reutilizables
   └── js/
       ├── app.js              # Punto de entrada e inicialización
       ├── router.js           # Motor de rutas SPA
       ├── store.js            # Estado global reactivo (Pub/Sub)
       ├── services/
       │   └── api.js          # Cliente HTTP para consumir Flask
       ├── components/         # Componentes UI puros (Navbar, Sidebar, Modal, Table, Toast)
       └── views/              # Vistas de página (Dashboard, Lotes, Labores, Historial, Login)
3. REGLAS DEL SISTEMA DE DISEÑO (DESIGN SYSTEM)
Todo el código visual debe regirse estrictamente por un sistema de diseño coherente, pensado para uso tanto en oficina como en campo (dispositivos móviles/tablets bajo luz solar):

Design Tokens (tokens.css):

Define todas las decisiones visuales en :root antes de escribir estilos de componentes. Prohibido usar valores hexadecimales o medidas arbitrarias "quemadas" en el código.

Paleta de color: Primarios inspirados en el sector agroindustrial (verdes bosque/cafeto profundos), neutros cálidos/grises limpios para fondos de alta legibilidad, y colores semánticos estrictos para estados (--color-success para cosecha/completado, --color-warning para labores próximas, --color-danger para alertas fitosanitarias/vencidas, --color-info).

Tipografía: Escala tipográfica modular clara (--text-xs a --text-2xl), jerarquía visual marcada y excelente legibilidad en tablas numéricas (font-variant-numeric: tabular-nums).

Espaciado y Elevación: Escala basada en múltiplos de 4px / 8px, radios de borde consistentes (--radius-sm, --radius-md, --radius-lg) y sombras sutiles para jerarquía de tarjetas.

Arquitectura de Componentes Reutilizables:

Construye funciones o Web Components nativos reutilizables para: Tarjetas KPI, Tablas de datos con búsqueda y filtros, Badges de estado (ej. Fertilización, Fumigación, Poda, Cosecha), Modales de creación/edición, Formularios con validación en tiempo real y Sistema de notificaciones tipo Toast.

Estados de Interfaz Obligatorios:

Toda vista asíncrona debe contemplar y renderizar 4 estados: Cargando (skeleton screens o spinners limpios), Con datos, Vacío (empty state con llamado a la acción claro) y Error (mensaje descriptivo con botón de reintento).

Diseño Responsivo y Accesibilidad (a11y):

Enfoque Mobile-First con áreas táctiles mínimas de 44x44px para facilitar el uso en campo.

Uso estricto de etiquetas semánticas (nav, main, section, article, header), atributos aria-live para cambios dinámicos en la SPA y contraste mínimo WCAG AA.

4. MÓDULOS FUNCIONALES A IMPLEMENTAR
Autenticación: Vista de Login conectada al endpoint de sesión/token de Flask.

Dashboard Operativo: Resumen ejecutivo con KPIs (hectáreas activas, labores pendientes de la semana, alertas de cultivo) y accesos rápidos.

Gestión de Lotes y Cultivos: CRUD completo de lotes diferenciando tipo de cultivo (Café vs. Plátano), variedad, área y estado fenológico.

Control de Labores Agrícolas: Registro, edición y filtrado cronológico de ciclos de Fertilización, Fumigación, Podas y Cosechas asociados a cada lote, incluyendo insumos aplicados y observaciones.

5. PROTOCOLO DE EJECUCIÓN (CÓMO DEBES PROCEDER)
Antes de escribir la capa de servicios (api.js): Solicítame la lista de endpoints de mi API en Flask junto con un ejemplo de sus payloads JSON (request/response). Si aún no los tienes a la mano, crea un modo Mock limpio en api.js fácilmente intercambiable por las URLs reales.

Construcción incremental:

Paso 1: Crea la estructura base, index.html, tokens.css y el sistema de diseño base.

Paso 2: Implementa el router.js, store.js y el layout principal (Sidebar/Navbar responsivo).

Paso 3: Desarrolla los componentes UI reutilizables y cada vista funcional conectada al cliente API.

Calidad de código: Entrega código limpio, comentado únicamente donde la lógica lo requiera, sin librerías externas ocultas y listo para abrirse directamente en el navegador mediante un servidor local estático.


**Un detalle técnico clave antes de pasárselo al agente:**
En el punto 1 del prompt dejé una nota sobre **Bootstrap y Tailwind**. Si cargas ambos completos a la vez en el HTML, sus hojas de reinicio (*Preflight* de Tailwind y *Reboot* de Bootstrap) chocan entre sí y alteran márgenes, botones y fuentes. Te recomiendo elegir **Tailwind CSS** como motor principal (encaja mucho mejor con un Design System basado en tokens propios) o dejar solo **Bootstrap 5** si prefieres sus modales y grillas ya armados, borrando el que no vayas a usar en la sección de tecnologías permitidas.

