import store from "./store.js";
import { apiClient } from "./services/api.js";
import {
  addRoute,
  navigateTo,
  initRouter,
  matchRoute,
} from "./router.js";
import { Navbar } from "./components/navbar.js";
import { LoginView } from "./views/login.js";
import { DashboardView } from "./views/dashboard.js";
import { LotesView } from "./views/lotes.js";
import { LoteDetalleView } from "./views/lote-detalle.js";
import { QRView } from "./views/qr.js";
import { LaboresView } from "./views/labores.js";
import { LaborDetalleView } from "./views/labor-detalle.js";
import { PerfilView } from "./views/perfil.js";
import { CalendarioView } from "./views/calendario.js";
import { InsumosView } from "./views/insumos.js";
import { InsumoDetalleView } from "./views/insumo-detalle.js";
import { CosechasView } from "./views/cosechas.js";
import { CosechaDetalleView } from "./views/cosecha-detalle.js";
import { FincasView } from "./views/fincas.js";
import { FincaDetalleView } from "./views/finca-detalle.js";
import { UsuariosView } from "./views/usuarios.js";
import { UsuarioDetalleView } from "./views/usuario-detalle.js";

export { navigateTo };

let currentCleanup = null;

const mount = (elementId, html) => {
  const root = document.getElementById(elementId);
  if (root) root.innerHTML = html;
};

const showToast = (message, type = "info") => {
  store.notify(message, type);
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
};

/* Valida que los campos requeridos del FormData no esten vacíos.
   Retorna true si todo esta completo, false y muestra toast si falta alguno. */
const validateRequired = (fd, fields) => {
  for (const field of fields) {
    const value = fd.get(field);
    if (value == null || value.toString().trim() === "") {
      alert("Faltan datos: complete todos los campos requeridos antes de guardar.");
      return false;
    }
  }
  return true;
};

const requireAuth = () => {
  const { isAuthenticated } = store.getState();
  if (!isAuthenticated) {
    showToast("Debes iniciar sesion para acceder a esta seccion", "warning");
    goTo("/login");
    return false;
  }
  return true;
};

const renderCurrentRoute = () => {
  const match = matchRoute(window.location.pathname);
  if (!match) {
    renderNotFound();
    return;
  }

  const { user } = store.getState();

  /* Rutas públicas */
  if (window.location.pathname === "/" || window.location.pathname === "/login") {
    renderWithNavbar(() => LoginView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname === "/qr") {
    renderWithNavbar(() => QRView(document.getElementById("spa-content")));
    return;
  }

  /* Rutas protegidas */
  if (!requireAuth()) return;

  if (window.location.pathname === "/dashboard") {
    renderWithNavbar(() => DashboardView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname === "/lotes") {
    renderWithNavbar(() => LotesView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname.startsWith("/lotes/")) {
    renderWithNavbar(() =>
      LoteDetalleView(document.getElementById("spa-content"), match.params)
    );
    return;
  }
  if (window.location.pathname === "/labores") {
    renderWithNavbar(() => LaboresView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname.startsWith("/labores/")) {
    renderWithNavbar(() =>
      LaborDetalleView(document.getElementById("spa-content"), match.params)
    );
    return;
  }
  if (window.location.pathname === "/calendario") {
    renderWithNavbar(() => CalendarioView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname === "/insumos") {
    renderWithNavbar(() => InsumosView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname.startsWith("/insumos/")) {
    renderWithNavbar(() =>
      InsumoDetalleView(document.getElementById("spa-content"), match.params)
    );
    return;
  }
  if (window.location.pathname === "/cosechas") {
    renderWithNavbar(() => CosechasView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname.startsWith("/cosechas/")) {
    renderWithNavbar(() =>
      CosechaDetalleView(document.getElementById("spa-content"), match.params)
    );
    return;
  }
  if (window.location.pathname === "/perfil") {
    renderWithNavbar(() => PerfilView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname === "/fincas") {
    renderWithNavbar(() => FincasView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname.startsWith("/fincas/")) {
    renderWithNavbar(() =>
      FincaDetalleView(document.getElementById("spa-content"), match.params)
    );
    return;
  }
  if (window.location.pathname === "/usuarios") {
    renderWithNavbar(() => UsuariosView(document.getElementById("spa-content")));
    return;
  }
  if (window.location.pathname.startsWith("/usuarios/")) {
    renderWithNavbar(() =>
      UsuarioDetalleView(document.getElementById("spa-content"), match.params)
    );
    return;
  }

  renderNotFound();
};

const goTo = (path) => {
  navigateTo(path);
  renderCurrentRoute();
};

const renderWithNavbar = (viewFn) => {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";

  const navbarEl = document.createElement("div");
  app.prepend(navbarEl);
  Navbar(navbarEl, {
    onLogin: () => goTo("/login"),
    onLogout: async () => {
      try {
        await apiClient.post("/api/auth/logout");
      } catch (e) {
        /* Ignorar errores de logout */
      }
      store.setState({ user: null, isAuthenticated: false, fincaSeleccionada: null });
      goTo("/login");
    },
    onUserProfile: () => goTo("/perfil"),
  });

  const contentEl = document.createElement("div");
  contentEl.id = "spa-content";
  app.appendChild(contentEl);

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  const cleanup = viewFn(contentEl);
  currentCleanup = cleanup && cleanup.destroy ? cleanup.destroy : null;
};

const renderNotFound = () => {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  const navbarEl = document.createElement("div");
  app.prepend(navbarEl);
  Navbar(navbarEl, {
    onLogin: () => goTo("/login"),
    onLogout: () => {},
    onUserProfile: () => {},
  });

  const contentEl = document.createElement("div");
  contentEl.id = "spa-content";
  app.appendChild(contentEl);
  contentEl.innerHTML = `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <h1 class="display-1 fw-bold">404</h1>
          <p class="lead text-muted">Pagina no encontrada</p>
          <a href="/" class="btn btn-primary" data-router>Ir al inicio</a>
        </div>
      </div>
    </div>
  `;
};

const initApp = async () => {
  /* Cargar datos iniciales desde la API */
  let loadOk = false;
  try {
    const results = await Promise.allSettled([
      apiClient.get("/api/fincas"),
      apiClient.get("/api/usuarios"),
      apiClient.get("/api/lotes"),
      apiClient.get("/api/labores"),
      apiClient.get("/api/cosechas"),
      apiClient.get("/api/insumos"),
      apiClient.get("/api/eventos"),
    ]);

    const keys = [
      "fincas",
      "usuariosRegistrados",
      "lotes",
      "labores",
      "cosechas",
      "insumos",
      "eventos",
    ];
    results.forEach((res, i) => {
      if (res.status === "fulfilled") {
        store.setState({ [keys[i]]: res.value });
      } else {
        console.error(`[initApp] Failed to load ${keys[i]}:`, res.reason);
      }
    });
    loadOk = true;
  } catch (e) {
    console.error("[initApp] Critical error loading data:", e);
    showToast("Error cargando datos iniciales", "danger");
  }

  /* Verificar sesion existente al cargar */
  try {
    const res = await apiClient.get("/api/auth/me");
    if (res && res.user) {
      if (res.user.rol === "MAYORDOMO" && res.user.finca_id) {
        store.setState({
          user: res.user,
          isAuthenticated: true,
          fincaSeleccionada: res.user.finca_id,
        });
      } else if (res.user.rol === "SUPERADMIN" || res.user.rol === "ADMIN") {
        store.setState({
          user: res.user,
          isAuthenticated: true,
          fincaSeleccionada: store.getDefaultFincaId(),
        });
      } else {
        store.setState({ user: res.user, isAuthenticated: true });
      }
    }
  } catch (e) {
    console.warn("[initApp] No active session:", e);
  }

  if (!loadOk) {
    showToast("Algunos datos no pudieron cargarse. Refresca la pagina.", "warning");
  }

  /* Registrar rutas (solo para matchRoute) */
  addRoute("/", () => {});
  addRoute("/login", () => {});
  addRoute("/dashboard", () => {});
  addRoute("/lotes", () => {});
  addRoute("/lotes/:id", () => {});
  addRoute("/labores", () => {});
  addRoute("/labores/:id", () => {});
  addRoute("/calendario", () => {});
  addRoute("/insumos", () => {});
  addRoute("/insumos/:id", () => {});
  addRoute("/cosechas", () => {});
  addRoute("/cosechas/:id", () => {});
  addRoute("/perfil", () => {});
  addRoute("/fincas", () => {});
  addRoute("/fincas/:id", () => {});
  addRoute("/usuarios", () => {});
  addRoute("/usuarios/:id", () => {});
  addRoute("/qr", () => {});

  /* Inicializar router con callback de renderizado */
  initRouter((handler, params) => {
    renderCurrentRoute();
  });

  /* Renderizar ruta inicial */
  renderCurrentRoute();
};

window.addEventListener("DOMContentLoaded", initApp);

/* Generar QR code usando API externa (sin librerias JS adicionales) */
export const generateQR = (data) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

export { mount, showToast, requireAuth, goTo, validateRequired };
