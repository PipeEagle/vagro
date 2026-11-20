/* Vista: Cosechas (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const CosechasView = (container) => {
  let selectedId = null;
  let cosechas = store.getState().cosechas;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    cosechas = store.getState().cosechas;

    let cosechasFiltradas = cosechas;
    if (user?.rol === "MAYORDOMO") {
      cosechasFiltradas = cosechas.filter((c) => c.finca_id === user.finca_id);
    } else if (fincaSeleccionada) {
      cosechasFiltradas = cosechas.filter((c) => c.finca_id === fincaSeleccionada);
    }

    const puedeEditar =
      user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Registro de Cosechas</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevaCosecha">Nueva cosecha</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table data-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Fecha</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Calidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${cosechasFiltradas
                  .map(
                    (c) => {
                      const isSel = selectedId === c.id;
                      return `
                  <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-cosecha-id="${c.id}">
                    <td>${c.lote_codigo_qr}</td>
                    <td>${c.fecha}</td>
                    <td>${c.cantidad}</td>
                    <td>${c.unidad}</td>
                    <td>${c.calidad}</td>
                    <td>${StatusBadgeHTML(c.estado)}</td>
                  </tr>
                `;
                    }
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        ${cosechasFiltradas.length === 0 ? `
          <div class="text-center py-4 text-muted">No hay cosechas registradas para esta finca.</div>
        ` : ""}
      </div>
    `;

    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-cosecha-id]");
        if (!tr) return;
        const id = parseInt(tr.getAttribute("data-cosecha-id"), 10);
        goTo(`/cosechas/${id}`);
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevaCosecha").addEventListener("click", () => {
        abrirModalNueva();
      });
    }
  };

  const StatusBadgeHTML = (estado) => {
    const colores = { Completada: "success", Programada: "info", Pendiente: "warning" };
    return `<span class="badge bg-${colores[estado] || "secondary"}">${estado}</span>`;
  };

  const abrirModalNueva = () => {
    Modal({
      id: "modalNuevaCosecha",
      title: "Nueva cosecha",
      bodyHtml: `
        <form id="formNuevaCosecha">
          <div class="mb-3">
            <label class="form-label">Lote</label>
            <input type="text" class="form-control" name="lote" required placeholder="LOTE-CAF-001">
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-control" name="fecha" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Cantidad</label>
            <input type="number" class="form-control" name="cantidad" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Unidad</label>
            <select class="form-select" name="unidad">
              <option value="@">Arrobas (@)</option>
              <option value="kg">Kilogramos (kg)</option>
              <option value="cargas">Cargas</option>
              <option value="racimos">Racimos</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Calidad</label>
            <select class="form-select" name="calidad">
              <option value="Primera">Primera</option>
              <option value="Segunda">Segunda</option>
              <option value="Rechazo">Rechazo</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="Programada">Programada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formNuevaCosecha");
        const fd = new FormData(form);
        const { fincaSeleccionada, user } = store.getState();
        const nuevo = {
          id: Date.now(),
          finca_id: fincaSeleccionada || user?.finca_id || 1,
          lote_codigo_qr: fd.get("lote"),
          fecha: fd.get("fecha"),
          cantidad: parseFloat(fd.get("cantidad")),
          unidad: fd.get("unidad"),
          calidad: fd.get("calidad"),
          estado: fd.get("estado"),
        };
        cosechas.push(nuevo);
        store.setState({ cosechas });
        render();
        showToast("Cosecha registrada correctamente", "success");
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
