/* Vista: Labores (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const LaboresView = (container) => {
  let selectedId = null;
  let labores = store.getState().labores;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    labores = store.getState().labores;

    let laboresFiltradas = labores;
    if (user?.rol === "MAYORDOMO") {
      laboresFiltradas = labores.filter((l) => l.finca_id === user.finca_id);
    } else if (fincaSeleccionada) {
      laboresFiltradas = labores.filter((l) => l.finca_id === fincaSeleccionada);
    }

    const puedeEditar =
      user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Control de labores</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevaLabor">Nueva labor</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table data-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Tipo de labor</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${laboresFiltradas
                  .map(
                    (labor) => {
                      const isSel = selectedId === labor.id;
                      return `
                  <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-labor-id="${labor.id}">
                    <td>${labor.lote_codigo_qr}</td>
                    <td>${StatusBadge({ estado: labor.tipo, tipo: "labor" })}</td>
                    <td>${labor.fecha}</td>
                    <td>${StatusBadge({ estado: labor.estado, tipo: "estado" })}</td>
                  </tr>
                `;
                    }
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        ${laboresFiltradas.length === 0 ? `
          <div class="text-center py-4 text-muted">No hay labores registradas para esta finca.</div>
        ` : ""}
      </div>
    `;

    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-labor-id]");
        if (!tr) return;
        const id = parseInt(tr.getAttribute("data-labor-id"), 10);
        goTo(`/labores/${id}`);
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevaLabor").addEventListener("click", () => {
        abrirModalNueva();
      });
    }
  };

  const abrirModalNueva = () => {
    Modal({
      id: "modalNuevaLabor",
      title: "Nueva labor agricola",
      bodyHtml: `
        <form id="formNuevaLabor">
          <div class="mb-3">
            <label class="form-label">Lote</label>
            <input type="text" class="form-control" name="lote" required placeholder="LOTE-CAF-001">
          </div>
          <div class="mb-3">
            <label class="form-label">Tipo de labor</label>
            <select class="form-select" name="tipo">
              <option value="fertilizacion">Fertilizacion</option>
              <option value="fumigacion">Fumigacion</option>
              <option value="poda">Poda</option>
              <option value="cosecha">Cosecha</option>
              <option value="riego">Riego</option>
              <option value="siembra">Siembra</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-control" name="fecha" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="Programada">Programada</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formNuevaLabor");
        const fd = new FormData(form);
        const { fincaSeleccionada, user } = store.getState();
        const nuevo = {
          id: Date.now(),
          finca_id: fincaSeleccionada || user?.finca_id || 1,
          lote_codigo_qr: fd.get("lote"),
          tipo: fd.get("tipo"),
          fecha: fd.get("fecha"),
          estado: fd.get("estado"),
        };
        labores.push(nuevo);
        store.setState({ labores });
        render();
        showToast("Labor registrada correctamente", "success");
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
