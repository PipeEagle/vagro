# Frontend AgroGestion

La interfaz actual es una SPA de JavaScript nativo ubicada en `spa/`. Flask entrega `spa/index.html` y sirve sus recursos; las carpetas heredadas `static/` y `templates/` fueron retiradas.

## Estructura principal

- `spa/index.html`: documento de entrada y carga de Bootstrap y módulos JavaScript.
- `spa/css/`: tokens, estilos base y componentes.
- `spa/js/app.js`: inicialización y montaje de la aplicación.
- `spa/js/router.js`: navegación del lado del cliente.
- `spa/js/store.js`: estado compartido de la interfaz.
- `spa/js/services/`: comunicación con la API.
- `spa/js/components/`: navbar, modales y componentes reutilizables.
- `spa/js/views/`: dashboard, lotes, labores, cultivos, cosechas, insumos, fincas, usuarios, calendario y detalles.

## Ejecución

La SPA está integrada con la API Flask y debe ejecutarse a través del backend, no desde Live Server:

```powershell
Set-Location .\backend
.\.venv\Scripts\Activate.ps1
python run.py
```

Abre `http://127.0.0.1:5000`. Para el arranque desde la raíz del proyecto, consulta [arranque.txt](../arranque.txt).

La opción de alta de usuario no asigna finca; la asociación se gestiona posteriormente desde la interfaz administrativa.
