/* Vista: Cosechas (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";
import { isFutureDate, isPastDate } from "../utils/date.js";

export const CosechasView = (container) => {
  let selectedId = null;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    const cosechas = store.getState().cosechas || [];
    const fincaActiva = store.getEffectiveFincaId();

    let cosechasFiltradas = cosechas;
    if (user?.rol === "MAYORDOMO" && user.finca_id) {
      cosechasFiltradas = cosechas.filter((c) => Number(c.finca_id) === Number(user.finca_id));
    } else if (fincaActiva) {
      cosechasFiltradas = cosechas.filter((c) => Number(c.finca_id) === Number(fincaActiva));
    }
    // Si no hay finca seleccionada y no es mayordomo, muestra TODAS las cosechas

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
                ${cosechasFiltradas.length > 0
                  ? cosechasFiltradas
                      .map(
                        (c) => {
                          const isSel = selectedId === c.id;
                          return `
                    <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-cosecha-id="${c.id}">
                      <td>${c.lote_codigo_qr}</td>
                      <td>${c.fecha}</td>
                      <td>${c.estado === "Pendiente" || c.estado === "Por confirmar" ? "Pendiente" : c.cantidad}</td>
                      <td>${c.unidad}</td>
                      <td>${c.calidad}</td>
                      <td>${StatusBadge({ estado: c.estado, tipo: "estado" })}</td>
                    </tr>
                  `;
                        }
                      )
                      .join("")
                  : '<tr><td colspan="6" class="text-center text-muted py-3">No hay cosechas registradas.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
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
    const colores = { Completada: "success", Pendiente: "warning" };
    return `<span class="badge bg-${colores[estado] || "secondary"}">${estado}</span>`;
  };

  const abrirModalNueva = () => {
    const { fincaSeleccionada, user } = store.getState();
    const fincaId =
      fincaSeleccionada || user?.finca_id || store.getDefaultFincaId();
    if (!fincaId) {
      showToast("No hay fincas disponibles para asignar la cosecha.", "danger");
      return;
    }

    const lotesDisponibles = (store.getState().lotes || []).filter(
      (lote) => Number(lote.finca_id) === Number(fincaId)
    );
    if (lotesDisponibles.length === 0) {
      showToast("Crea un lote en la finca seleccionada antes de registrar cosechas.", "warning");
      return;
    }

    Modal({
      id: "modalNuevaCosecha",
      title: "Nueva cosecha",
      bodyHtml: `
        <form id="formNuevaCosecha">
          <div class="mb-3">
            <label class="form-label">Lote</label>
            <select class="form-select" name="lote_codigo_qr" required>
              <option value="">Selecciona un lote</option>
              ${lotesDisponibles.map((lote) => `<option value="${lote.codigo_qr}">${lote.nombre} (${lote.codigo_qr})</option>`).join("")}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-control" name="fecha" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Cantidad</label>
            <input type="number" class="form-control" name="cantidad" min="0" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Unidad</label>
            <select class="form-select" name="unidad" required>
              <option value="kg">Kilogramos (kg)</option>
              <option value="cargas">Cargas</option>
              <option value="racimos">Racimos</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Calidad</label>
            <select class="form-select" name="calidad" required>
              <option value="Primera">Primera</option>
              <option value="Segunda">Segunda</option>
              <option value="Rechazo">Rechazo</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado" id="estadoNuevaCosecha" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Por confirmar">Por confirmar</option>
              <option value="Completada">Completada</option>
            </select>
            <div class="form-text">Las cosechas con fecha anterior a hoy se marcaran como Completada.</div>
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formNuevaCosecha");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["lote_codigo_qr", "fecha", "cantidad", "unidad", "calidad"])) return false;
        const fecha = fd.get("fecha");
        const estado = isPastDate(fecha) ? "Completada" : fd.get("estado");
        if (isFutureDate(fecha) && estado === "Completada") {
          showToast("Una cosecha futura no puede marcarse como Completada antes de su fecha.", "danger");
          return false;
        }

        const lote = lotesDisponibles.find(
          (item) => item.codigo_qr === fd.get("lote_codigo_qr")
        );
        if (!lote) {
          showToast("Selecciona un lote de la finca activa.", "danger");
          return false;
        }

        try {
          const nueva = await apiClient.post("/api/cosechas", {
            finca_id: fincaId,
            lote_codigo_qr: lote.codigo_qr,
            fecha,
            cantidad: parseFloat(fd.get("cantidad")),
            unidad: fd.get("unidad"),
            calidad: fd.get("calidad"),
            estado,
          });

          const { cosechas } = store.getState();
          store.setState({ cosechas: [...cosechas, nueva] });

          render();
          showToast("Cosecha registrada correctamente", "success");
        } catch (e) {
          showToast(e.message || "Error al registrar la cosecha", "danger");
          return false;
        }
        return true;
      },
      confirmLabel: "Crear",
    });

    const form = document.getElementById("formNuevaCosecha");
    const fechaInput = form.querySelector('[name="fecha"]');
    const estadoSelect = form.querySelector('[name="estado"]');
    const actualizarEstadoSegunFecha = () => {
      const esFechaFutura = isFutureDate(fechaInput.value);
      const esFechaPasada = isPastDate(fechaInput.value);
      const opcionCompletada = estadoSelect.querySelector('option[value="Completada"]');
      opcionCompletada.disabled = esFechaFutura;
      if (esFechaFutura && estadoSelect.value === "Completada") {
        estadoSelect.value = "Pendiente";
      }
      if (esFechaPasada) estadoSelect.value = "Completada";
      estadoSelect.disabled = esFechaPasada;
    };
    fechaInput.addEventListener("input", actualizarEstadoSegunFecha);
    fechaInput.addEventListener("change", actualizarEstadoSegunFecha);
  };

  render();

  return { destroy: () => {} };
};
