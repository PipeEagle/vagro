/* Vista: Perfil (protegida) */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { showToast, goTo } from "../app.js";

export const PerfilView = (container) => {
  const { user } = store.getState();
  const fincas = store.getState().fincas || [];
  const fincaAsignada = user?.finca_id ? fincas.find(f => f.id === user.finca_id) : null;

  const render = () => {
    container.innerHTML = `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow-sm">
              <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                  <div class="avatar mx-auto mb-3">${user?.nombre_completo?.charAt(0) || "A"}</div>
                  <h3 class="h4 mb-1">${user?.nombre_completo || "Usuario"}</h3>
                  <p class="text-muted small">@${user?.username}</p>
                </div>
                <hr />
                <div class="mb-3">
                  <label class="form-label fw-bold">Usuario</label>
                  <p class="form-control-plaintext">${user?.username}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Rol</label>
                  <span class="badge bg-primary">${user?.rol || "ADMIN"}</span>
                </div>
                ${fincaAsignada ? `
                <div class="mb-3">
                  <label class="form-label fw-bold">Finca asignada</label>
                  <span class="badge bg-info">${fincaAsignada.nombre}</span>
                </div>
                ` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  render();

  return { destroy: () => {} };
};
