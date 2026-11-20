/* Vista: Lotes (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const LotesView = (container) => {
  let selectedId = null;
  let lotes = store.getState().lotes;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    lotes = store.getState().lotes;

    let lotesFiltrados = lotes;
    if (user?.rol === "MAYORDOMO") {
      lotesFiltrados = lotes.filter((l) => l.finca_id === user.finca_id);
    } else if (fincaSeleccionada) {
      lotesFiltrados = lotes.filter((l) => l.finca_id === fincaSeleccionada);
    }

    const puedeEditar =
      user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Gestion de lotes</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevoLote">Nuevo lote</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table data-table">
              <thead>
                <tr>
                  <th>Codigo QR</th>
                  <th>Nombre</th>
                  <th>Cultivo</th>
                  <th>Hectareas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${lotesFiltrados
                  .map(
                    (lote) => {
                      const isSel = selectedId === lote.id;
                      return `
                  <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-lote-id="${lote.id}">
                    <td>${lote.codigo_qr}</td>
                    <td>${lote.nombre}</td>
                    <td>${lote.cultivo?.nombre || "-"}</td>
                    <td>${lote.hectareas.toFixed(2)} ha</td>
                    <td>${StatusBadge({ estado: lote.estado, tipo: "estado" })}</td>
                  </tr>
                `;
                    }
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        ${lotesFiltrados.length === 0 ? `
          <div class="text-center py-4 text-muted">No hay lotes registrados para esta finca.</div>
        ` : ""}
      </div>
    `;

    /* Event delegation: clic en fila abre detalle */
    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-lote-id]");
        if (!tr) return;
        const id = parseInt(tr.getAttribute("data-lote-id"), 10);
        goTo(`/lotes/${id}`);
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevoLote").addEventListener("click", () => {
        abrirModalNuevo();
      });
    }
  };

  const abrirModalNuevo = () => {
    Modal({
      id: "modalNuevoLote",
      title: "Nuevo lote",
      bodyHtml: `
        <form id="formNuevoLote">
          <div class="mb-3">
            <label class="form-label">Codigo QR</label>
            <input type="text" class="form-control" name="codigo_qr" required placeholder="LOTE-CAF-002">
          </div>
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" name="nombre" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Cultivo</label>
            <select class="form-select" name="cultivo">
              <option value="cafe">Cafe</option>
              <option value="platano">Platano</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Hectareas</label>
            <input type="number" class="form-control" name="hectareas" step="0.01" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="ACTIVO">Activo</option>
              <option value="EN_DESCANSO">En descanso</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formNuevoLote");
        const fd = new FormData(form);
        const { fincaSeleccionada, user } = store.getState();
        const nuevo = {
          id: Date.now(),
          finca_id: fincaSeleccionada || user?.finca_id || 1,
          codigo_qr: fd.get("codigo_qr"),
          nombre: fd.get("nombre"),
          cultivo: { nombre: fd.get("cultivo") === "cafe" ? "Cafe" : "Platano" },
          hectareas: parseFloat(fd.get("hectareas")),
          estado: fd.get("estado"),
        };
        lotes.push(nuevo);
        store.setState({ lotes });
        render();
        showToast("Lote creado correctamente", "success");
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
