/* Vista: Labores (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const LaboresView = (container) => {
  let selectedId = null;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    const labores = store.getState().labores || [];
    const fincaActiva = store.getEffectiveFincaId();

    let laboresFiltradas = labores;
    if (user?.rol === "MAYORDOMO" && user.finca_id) {
      laboresFiltradas = labores.filter((l) => Number(l.finca_id) === Number(user.finca_id));
    } else if (fincaActiva) {
      laboresFiltradas = labores.filter((l) => Number(l.finca_id) === Number(fincaActiva));
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
                ${laboresFiltradas.length > 0
                  ? laboresFiltradas
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
                      .join("")
                  : '<tr><td colspan="4" class="text-center text-muted py-3">No hay labores registradas.</td></tr>'}
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
    const { fincaSeleccionada, user } = store.getState();
    const fincaId =
      fincaSeleccionada || user?.finca_id || store.getDefaultFincaId();
    if (!fincaId) {
      showToast("No hay fincas disponibles para asignar la labor.", "danger");
      return;
    }

    const lotesDisponibles = (store.getState().lotes || []).filter(
      (lote) => Number(lote.finca_id) === Number(fincaId)
    );
    if (lotesDisponibles.length === 0) {
      showToast("Crea un lote en la finca seleccionada antes de registrar labores.", "warning");
      return;
    }

    Modal({
      id: "modalNuevaLabor",
      title: "Nueva labor agricola",
      bodyHtml: `
        <form id="formNuevaLabor">
          <div class="mb-3">
            <label class="form-label">Lote</label>
            <select class="form-select" name="lote_id" required>
              <option value="">Selecciona un lote</option>
              ${lotesDisponibles.map((lote) => `<option value="${lote.id}">${lote.nombre} (${lote.codigo_qr})</option>`).join("")}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Tipo de labor</label>
            <select class="form-select" name="tipo" required>
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
            <input type="date" class="form-control" name="fecha" required min="${new Date().toISOString().split("T")[0]}">
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Por confirmar">Por confirmar</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formNuevaLabor");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["tipo", "fecha", "lote_id", "estado"])) return false;
        const fechaLabor = fd.get("fecha");
        const hoy = new Date().toISOString().split("T")[0];
        if (fechaLabor < hoy) {
          alert("No se pueden programar labores para fechas anteriores a hoy.");
          return false;
        }

        const loteId = Number(fd.get("lote_id"));
        const lote = lotesDisponibles.find(
          (item) => item.id === loteId && Number(item.finca_id) === Number(fincaId)
        );
        if (!lote) {
          showToast("Selecciona un lote de la finca activa.", "danger");
          return false;
        }

        try {
          const nueva = await apiClient.post("/api/labores", {
            finca_id: fincaId,
            lote_id: lote.id,
            tipo: fd.get("tipo"),
            fecha: fd.get("fecha"),
            estado: fd.get("estado"),
          });

          const { labores, eventos } = store.getState();
          const estadoCalendario =
            fd.get("estado") === "Completada" ? "Completada" : "Pendiente";

          const nuevoEvento = {
            fecha: nueva.fecha,
            titulo: `${nueva.tipo} - ${lote.codigo_qr}`,
            tipo: nueva.tipo,
            estado: estadoCalendario,
            finca_id: nueva.finca_id,
          };

          let eventoGuardado = null;
          try {
            eventoGuardado = await apiClient.post("/api/eventos", nuevoEvento);
          } catch (error) {
            showToast(
              `La labor se guardo, pero no se pudo agregar al calendario: ${error.message}`,
              "warning"
            );
          }

          store.setState({
            labores: [...labores, nueva],
            eventos: eventoGuardado ? [...eventos, eventoGuardado] : eventos,
          });

          render();
          showToast("Labor registrada correctamente", "success");
        } catch (e) {
          showToast(e.message || "Error al registrar la labor", "danger");
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
