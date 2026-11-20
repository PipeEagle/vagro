/* Vista: Login (publico) */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { showToast, goTo } from "../app.js";

/* Usuarios simulados para probar sin MySQL */
const MOCK_USERS = [
  { username: "admin", password: "Admin123!", nombre_completo: "Administrador", rol: "SUPERADMIN", finca_id: null },
  { username: "ingeniero", password: "Ing123!", nombre_completo: "Ingeniero Agronomo", rol: "ADMIN", finca_id: null },
  { username: "mayordomo1", password: "May123!", nombre_completo: "Mayordomo Finca Norte", rol: "MAYORDOMO", finca_id: 1 },
  { username: "mayordomo2", password: "May123!", nombre_completo: "Mayordomo Finca Sur", rol: "MAYORDOMO", finca_id: 2 },
];

export const LoginView = (container) => {
  let isSubmitting = false;
  let form = null;

  const render = () => {
    const { error, loading } = store.getState();
    container.innerHTML = `
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <span class="badge bg-success">A</span>
                <h2 class="h3 mt-3">AgroGestion</h2>
                <p class="text-muted small">Acceso de administrador</p>
              </div>

              ${
                error
                  ? `<div class="alert alert-danger" role="alert">${error}</div>`
                  : ""
              }

              <form id="loginForm" novalidate>
                <div class="mb-3">
                  <label class="form-label">Usuario</label>
                  <input
                    type="text"
                    class="form-control"
                    name="username"
                    required
                    autocomplete="username"
                    placeholder="admin"
                  />
                </div>
                <div class="mb-4">
                  <label class="form-label">Contrasena</label>
                  <input
                    type="password"
                    class="form-control"
                    name="password"
                    required
                    autocomplete="current-password"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2"
                  id="btnLogin"
                  ${isSubmitting ? "disabled" : ""}
                >
                  ${isSubmitting
                    ? '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...'
                    : "Iniciar sesion"}
                </button>
              </form>

              <div class="text-center mt-4 text-muted small">
                Usuario: admin | Contrasena: Admin123!
              </div>
              <div class="text-center mt-2 text-muted small">
                <small>Usuarios de prueba: mayordomo1 / mayordomo2 / ingeniero</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    form = container.querySelector("#loginForm");
    form.addEventListener("submit", handleLogin);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form) return;
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");

    if (!username || !password) {
      showToast("Ingresa usuario y contrasena", "error");
      return;
    }

    isSubmitting = true;
    render();

    /* Intentar login simulado primero */
    const usuariosRegistrados = store.getState().usuariosRegistrados || [];
    const mockUser = [
      ...MOCK_USERS,
      ...usuariosRegistrados.filter((u) => !MOCK_USERS.some((m) => m.username === u.username)),
    ].find((u) => u.username === username && u.password === password);
    if (mockUser) {
      store.setState({
        user: { username: mockUser.username, nombre_completo: mockUser.nombre_completo, rol: mockUser.rol, finca_id: mockUser.finca_id },
        isAuthenticated: true,
        error: null,
      });
      if (mockUser.rol === "MAYORDOMO" && mockUser.finca_id) {
        store.setState({ fincaSeleccionada: mockUser.finca_id });
      } else if (mockUser.rol === "SUPERADMIN" || mockUser.rol === "ADMIN") {
        store.setState({ fincaSeleccionada: 1 });
      }
      showToast("Sesion iniciada correctamente (modo simulacion)", "success");
      goTo("/dashboard");
      return;
    }

    /* Si no es usuario simulado, intentar backend real */
    try {
      const res = await apiClient.post("/api/auth/login", {
        username,
        password,
      });

      store.setState({
        user: res.user || { username },
        isAuthenticated: true,
        error: null,
      });
      if (res.user.rol === "MAYORDOMO" && res.user.finca_id) {
        store.setState({ fincaSeleccionada: res.user.finca_id });
      } else if (res.user.rol === "SUPERADMIN" || res.user.rol === "ADMIN") {
        store.setState({ fincaSeleccionada: 1 });
      }

      showToast("Sesion iniciada correctamente", "success");
      goTo("/dashboard");
    } catch (err) {
      const msg =
        err.status === 401
          ? "Usuario o contrasena incorrectos"
          : err.message || "Error al iniciar sesion";
      store.setState({ error: msg });
      render();
    } finally {
      isSubmitting = false;
      render();
    }
  };

  render();

  return {
    destroy: () => {
      const form = container.querySelector("#loginForm");
      if (form) form.removeEventListener("submit", handleLogin);
    },
  };
};
