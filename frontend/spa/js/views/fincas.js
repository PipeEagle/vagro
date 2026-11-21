/* Vista: Fincas (protegida, solo admin) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const FincasView = (container) => {
  let selectedId = null;

  const render = () => {
    const { user, fincas } = store.getState();
    const fincasList = fincas || [];
    const puedeEditar = user?.rol === "SUPERADMIN";

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Gestion de Fincas</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevaFinca">Nueva finca</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Municipio</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Mayordomo</th>
                </tr>
              </thead>
              <tbody>
                ${fincasList.length > 0
                  ? fincasList
                      .map(
                        (f) => {
                          const usuariosState = store.getState().usuariosRegistrados;
                          const usuarios = Array.isArray(usuariosState) ? usuariosState : [];
                          const mayordomo = usuarios.find((u) => u.finca_id === f.id);
                          const isSel = selectedId === f.id;
                          return `
                    <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-finca-id="${f.id}">
                      <td>${f.nombre}</td>
                      <td>${f.municipio}</td>
                      <td>${f.departamento}</td>
                      <td><span class="badge bg-${f.estado === "ACTIVO" ? "success" : f.estado === "EN_DESCANSO" ? "warning" : "secondary"}">${f.estado}</span></td>
                      <td>${mayordomo ? mayordomo.username : "-"}</td>
                    </tr>
                  `;
                        }
                      )
                      .join("")
                  : '<tr><td colspan="5" class="text-center text-muted py-3">No hay fincas registradas.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-finca-id]");
        if (!tr) return;
        const id = parseInt(tr.getAttribute("data-finca-id"), 10);
        goTo(`/fincas/${id}`);
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevaFinca").addEventListener("click", () => {
        abrirModalNueva();
      });
    }
  };

  const abrirModalNueva = async () => {
    const usuariosState = store.getState().usuariosRegistrados;
    const usuarios = Array.isArray(usuariosState) ? usuariosState : [];
    const mayordomosSinFinca = usuarios.filter(
      (u) => u.rol === "MAYORDOMO" && (!u.finca_id || u.finca_id === null)
    );
    Modal({
      id: "modalNuevaFinca",
      title: "Nueva finca",
      bodyHtml: `
        <form id="formNuevaFinca">
          <div class="mb-3">
            <label class="form-label">Nombre de la finca</label>
            <input type="text" class="form-control" name="nombre" required placeholder="Ej: Finca El Roble">
          </div>
          <div class="mb-3">
            <label class="form-label">Municipio</label>
            <input type="text" class="form-control" name="municipio" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Departamento</label>
            <input type="text" class="form-control" name="departamento" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado" required>
              <option value="ACTIVO">Activo</option>
              <option value="EN_DESCANSO">En descanso</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Asignar mayordomo</label>
            <select class="form-select" name="mayordomo_id">
              <option value="">Sin asignar (puedes asignarlo despues)</option>
              ${mayordomosSinFinca
                .map(
                  (m) =>
                    `<option value="${m.id}">${m.username} - ${m.nombre_completo}</option>`
                )
                .join("")}
            </select>
            ${mayordomosSinFinca.length === 0 ? '<div class="form-text text-muted">No hay mayordomos disponibles sin finca asignada.</div>' : ""}
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formNuevaFinca");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["nombre", "municipio", "departamento"])) return false;

        try {
          const nueva = await apiClient.post("/api/fincas", {
            nombre: fd.get("nombre"),
            municipio: fd.get("municipio"),
            departamento: fd.get("departamento"),
            estado: fd.get("estado"),
          });

          const { fincas } = store.getState();
          store.setState({ fincas: [...fincas, nueva] });

          const mayordomoId = fd.get("mayordomo_id");
          if (mayordomoId) {
            const currentUsuarios = store.getState().usuariosRegistrados || [];
            const updatedUsuarios = currentUsuarios.map((u) =>
              u.id === parseInt(mayordomoId) ? { ...u, finca_id: nueva.id } : u
            );
            store.setState({ usuariosRegistrados: updatedUsuarios });
          }

          render();
          showToast("Finca creada correctamente", "success");
        } catch (e) {
          showToast(e.message || "Error al crear la finca", "danger");
          return false;
        }
        return true;
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
