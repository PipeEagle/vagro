# ORDEN DE REFACTORIZACIÓN Y CORRECCIÓN DE UI/UX — AGROGESTIÓN

Aplica las siguientes correcciones obligatorias en todo el frontend SPA (tanto para el rol **Administrador** como para el rol **Mayordomo**), manteniendo estrictamente el stack permitido (HTML5, CSS3, Vanilla JS ES6+, Tailwind CSS / Bootstrap 5, sin frameworks):

## 1. NAVBAR Y SUBMENÚ DE USUARIO
- **Elimina** el botón de "Cerrar sesión", el enlace "Perfil" y las etiquetas de rol de la barra principal de navegación y del cuerpo del Dashboard.
- Implementa un **submenú desplegable (dropdown)** en la esquina superior derecha del Navbar.
- El botón disparador del submenú debe mostrar el identificador del usuario activo (su rol `Admin` / `Mayordomo`, nombre, correo electrónico o avatar con su inicial).
- Al hacer clic en ese disparador, se desplegará el submenú con únicamente dos opciones: **Perfil** y **Cerrar sesión**.
- Dentro de la vista de **Perfil**, elimina cualquier botón duplicado de cerrar sesión.

## 2. NAVEGACIÓN SPA Y LIMPIEZA DEL DASHBOARD
- **Carga dinámica inmediata:** Corrige el enrutador/controlador de vistas para que, al iniciar sesión o hacer clic en cualquier enlace del menú, la vista y sus datos se rendericen automáticamente sin tener que volver a hacer clic en "Dashboard" para actualizar.
- **Limpia el Dashboard:**
  - Elimina tarjetas o bloques que muestren datos del usuario activo o su rol.
  - Elimina por completo la sección de **"Acciones rápidas"** (no debe duplicar los enlaces que ya existen en el menú superior).
  - Elimina tarjetas redundantes que muestren información estática de la finca activa dentro del Dashboard.

## 3. SELECTOR GLOBAL DE FINCA ACTIVA
- Ubica un selector (`<select>`) de **Finca Activa** visible de forma permanente en el **Navbar superior** (junto al área de navegación o antes del submenú de usuario).
- Al seleccionar una finca en el Navbar, todas las vistas (`Lotes`, `Labores`, `Cosechas`, `Insumos`, `Calendario`) deben actualizar y filtrar sus datos dinámicamente según esa finca seleccionada, garantizando que el usuario siempre sepa en qué finca está trabajando.

## 4. PATRÓN ESTÁNDAR OBLIGATORIO: TABLA → VISTA DE DETALLE → MODALES
Aplica este flujo de interacción **sin excepción en todos los módulos** (`Lotes`, `Labores`, `Cosechas`, `Insumos`, `Fincas`, `Usuarios`) y en ambos roles (`Admin` y `Mayordomo`):
1. **Tablas limpias:** Las tablas principales deben mostrar únicamente columnas de datos. **PROHIBIDO** incluir columnas o botones de `Editar` y `Eliminar` dentro de las filas de las tablas.
2. **Navegación a Vista de Detalle (Página completa, NO modal):** Al hacer clic sobre cualquier fila/registro de una tabla, la SPA debe navegar a una **Vista de Detalle dedicada** (ej. `/lotes/:id`, `/labores/:id`, `/cosechas/:id`, `/insumos/:id`, `/fincas/:id`, `/usuarios/:id`).
3. **Controles dentro de la Vista de Detalle:**
   - Debe incluir un botón **Atrás / Volver** para regresar a la tabla principal.
   - Debe mostrar toda la información completa del registro y, únicamente dentro de esta vista, los botones de **Editar** y **Eliminar**.
4. **Uso estricto de Modales:**
   - **Crear:** El botón `Nuevo [Entidad]` en la vista de tabla abre un **Modal** con el formulario de creación (con botón `Cancelar`).
   - **Editar:** El botón `Editar` dentro de la **Vista de Detalle** abre un **Modal** con los datos precargados. Al guardar, permanece en la Vista de Detalle actualizada.
   - **Eliminar:** El botón `Eliminar` dentro de la **Vista de Detalle** abre un **Modal de alerta/confirmación**. Al confirmar la eliminación, redirige automáticamente a la tabla principal.

## 5. REGLAS DEL CALENDARIO DE EVENTOS
- El Calendario es exclusivamente una vista de visualización/consulta. **Elimina** el botón `"Nueva labor"` del calendario (la creación de labores pertenece únicamente a la vista de `Labores`).
- Al hacer clic sobre un evento dentro del calendario, **NO** abras un modal de edición; redirige directamente a la **Vista de Detalle** de esa labor, donde el usuario podrá ver su información y, si lo desea, editarla o eliminarla usando los botones del detalle.

## 6. SEPARACIÓN DE VISTAS EN ADMINISTRACIÓN (FINCAS Y USUARIOS)
- **Separa Fincas y Usuarios en dos vistas independientes:** Crea una vista exclusiva para **Fincas** (`/fincas`) y otra vista exclusiva para **Usuarios** (`/usuarios`) en el menú del Administrador. Nunca muestres ambas tablas juntas en la misma pantalla.
- Ambas vistas deben cumplir exactamente el mismo patrón del punto 4 (`Tabla limpia → Vista de Detalle → Modales de Crear/Editar/Eliminar`).
- **Creación de usuarios:** Elimina el campo de entrada manual de `Contraseña` en el modal de creación de usuario. El sistema/backend debe generar una contraseña aleatoria automática para el nuevo usuario (quien la cambiará posteriormente al iniciar sesión).