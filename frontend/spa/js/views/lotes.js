/* Vista: Lotes (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const LotesView = (container) => {
  let selectedId = null;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    const lotes = store.getState().lotes || [];

    let lotesFiltrados = lotes;
    if (user?.rol === "MAYORDOMO" && user.finca_id) {
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
                  <th>QR</th>
                </tr>
              </thead>
              <tbody>
                ${lotesFiltrados.length > 0
                  ? lotesFiltrados
                      .map(
                        (lote) => {
                          const isSel = selectedId === lote.id;
                          return `
                    <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-lote-id="${lote.id}">
                      <td>${lote.codigo_qr}</td>
                      <td>${lote.nombre}</td>
                      <td>${lote.cultivo?.nombre || "-"}</td>
                      <td>${parseFloat(lote.hectareas || 0).toFixed(2)} ha</td>
                      <td>${StatusBadge({ estado: lote.estado, tipo: "estado" })}</td>
                      <td>
                        <div class="d-flex gap-1 justify-content-center">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(lote.codigo_qr)}&size=40x40" alt="QR ${lote.codigo_qr}" style="width: 40px; height: 40px; object-fit: contain;">
                          <a href="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(lote.codigo_qr)}&size=200x200" download="${lote.codigo_qr}.png" class="btn btn-sm btn-outline-primary" title="Descargar QR" target="_blank"><i class="bi bi-download"></i></a>
                        </div>
                      </td>
                    </tr>
                  `;
                        }
                      )
                      .join("")
                  : '<tr><td colspan="6" class="text-center text-muted py-3">No hay lotes registrados.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        ${lotesFiltrados.length === 0 ? `
          <div class="text-center py-4 text-muted">No hay lotes registrados para esta finca.</div>
        ` : ""}
      </div>
    `;

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

  const abrirModalNuevo = async () => {
    const { fincaSeleccionada, user } = store.getState();
    Modal({
      id: "modalNuevoLote",
      title: "Nuevo lote",
      bodyHtml: `
        <form id="formNuevoLote">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" name="nombre" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Cultivo</label>
            <select class="form-select" name="cultivo_id" required>
              <option value="1">Cafe</option>
              <option value="2">Platano</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Hectareas</label>
            <input type="number" class="form-control" name="hectareas" step="0.01" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado" required>
              <option value="ACTIVO">Activo</option>
              <option value="EN_DESCANSO">En descanso</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formNuevoLote");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["nombre", "cultivo_id", "hectareas"])) return false;

        const fincaId =
          fincaSeleccionada || user?.finca_id || store.getDefaultFincaId();
        if (!fincaId) {
          showToast("No hay fincas disponibles para asignar el lote.", "danger");
          return false;
        }

        try {
          const nuevo = await apiClient.post("/api/lotes", {
            finca_id: fincaId,
            cultivo_id: parseInt(fd.get("cultivo_id")),
            codigo_qr: `LOTE-CAF-${Date.now().toString().slice(-3)}`,
            nombre: fd.get("nombre"),
            hectareas: parseFloat(fd.get("hectareas")),
            estado: fd.get("estado"),
          });

          const { lotes } = store.getState();
          store.setState({ lotes: [...lotes, nuevo] });

          render();
          showToast("Lote creado correctamente", "success");
        } catch (e) {
          showToast(e.message || "Error al crear el lote", "danger");
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
