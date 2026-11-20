/* Componente: Navbar responsivo */
import store from "../store.js";
import { goTo } from "../app.js";

export const Navbar = (container, { onLogin, onLogout, onUserProfile }) => {
  const { user } = store.getState();
  const path = window.location.pathname;

  /* Helper para determinar si una ruta está activa (incluye rutas con parametros) */
  const isActive = (basePath) => {
    if (path === basePath) return true;
    if (basePath === "/" && (path === "/" || path === "/dashboard")) return true;
    return path.startsWith(basePath + "/");
  };

  const iniciales = (nombre) => {
    if (!nombre) return "U";
    return nombre.split(" ")
      .map((p) => p.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const html = `
    <nav class="navbar-agro navbar navbar-expand-lg px-3 py-2">
      <div class="container-fluid">
        <a href="/" class="navbar-brand" data-router>
          <span class="brand-symbol">A</span>
          <span>AgroGestion</span>
        </a>

        <div class="collapse navbar-collapse" id="navbarAgro">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${user ? `
              <li class="nav-item">
                <a class="nav-link ${isActive("/dashboard") ? "active" : ""}" href="/dashboard" data-router>Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${isActive("/lotes") ? "active" : ""}" href="/lotes" data-router>Lotes</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${isActive("/labores") ? "active" : ""}" href="/labores" data-router>Labores</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${isActive("/calendario") ? "active" : ""}" href="/calendario" data-router>Calendario</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${isActive("/insumos") ? "active" : ""}" href="/insumos" data-router>Insumos</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${isActive("/cosechas") ? "active" : ""}" href="/cosechas" data-router>Cosechas</a>
              </li>
              ${user.rol === "SUPERADMIN" ? `
              <li class="nav-item">
                <a class="nav-link ${isActive("/fincas") ? "active" : ""}" href="/fincas" data-router>Fincas</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${isActive("/usuarios") ? "active" : ""}" href="/usuarios" data-router>Usuarios</a>
              </li>
              ` : ""}
            ` : ""}
          </ul>
          <ul class="navbar-nav mb-2 mb-lg-0">
            <!-- Selector global de finca activa (solo para ADMIN/SUPERADMIN), separado del usuario -->
            ${user && user.rol !== "MAYORDOMO" ? `
            <li class="nav-item me-3">
              <select class="form-select form-select-sm" id="selectFincaActiva" style="max-width: 180px;">
                <option value="" ${store.getState().fincaSeleccionada == null ? "selected" : ""}>Todas las fincas</option>
                ${store.getState().fincas.map((f) => `
                  <option value="${f.id}" ${store.getState().fincaSeleccionada === f.id ? "selected" : ""}>${f.nombre}</option>
                `).join("")}
              </select>
            </li>
            ` : ""}
            ${user ? `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="btnUserMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span class="avatar-sm me-2" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#1b5e20;color:#fff;font-weight:700;font-size:0.9rem;">
                    ${iniciales(user.nombre_completo || user.username)}
                  </span>
                  <span class="d-none d-md-inline">${user.nombre_completo || user.username}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="/perfil" data-router>Perfil</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" id="btnLogout">Cerrar sesion</a></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item ${path === "/" || path === "/login" ? "d-none" : ""}">
                <a class="nav-link" href="/login" data-router>Iniciar sesion</a>
              </li>
            `}
          </ul>
        </div>
      </div>
    </nav>
  `;

  container.innerHTML = html;

  /* Inicializar dropdown de Bootstrap para el menu de usuario */
  const dropdownEl = container.querySelector("#btnUserMenu");
  if (dropdownEl && window.bootstrap) {
    new window.bootstrap.Dropdown(dropdownEl);
  }

  /* Selector de finca activa */
  const selectFinca = container.querySelector("#selectFincaActiva");
  if (selectFinca) {
    selectFinca.addEventListener("change", (e) => {
      const fincaId = e.target.value ? parseInt(e.target.value) : null;
      store.setState({ fincaSeleccionada: fincaId });
      goTo(window.location.pathname);
    });
  }

  const btnLogout = container.querySelector("#btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      onLogout();
    });
  }
};

export const destroyNavbar = () => {
  /* Sin listeners globales que limpiar */
};
