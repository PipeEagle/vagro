/* Vista: LoteDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const LoteDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar =
    user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

  let lote = null;

  const render = () => {
    const { lotes } = store.getState();
    lote = lotes.find((l) => l.id === parseInt(id));
    if (!lote) {
      container.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-1 fw-bold">404</h1>
            <p class="lead text-muted">Lote no encontrado</p>
            <a href="/lotes" class="btn btn-primary" data-router>Volver a lotes</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-secondary" id="btnAtras" data-router>Atras</button>
          <h2>${lote.nombre}</h2>
          <div class="d-flex gap-2">
            ${puedeEditar ? `<button class="btn btn-outline" id="btnEditar">Editar</button>` : ""}
            ${puedeEditar ? `<button class="btn btn-danger" id="btnEliminar">Eliminar</button>` : ""}
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Informacion del lote</h5>
                <p><strong>Codigo QR:</strong> ${lote.codigo_qr}</p>
                <p><strong>Nombre:</strong> ${lote.nombre}</p>
                <p><strong>Cultivo:</strong> ${lote.cultivo?.nombre || "-"}</p>
                <p><strong>Area:</strong> ${lote.hectareas.toFixed(2)} ha</p>
                <p><strong>Estado:</strong> ${StatusBadge({ estado: lote.estado, tipo: "estado" })}</p>
                <p><strong>Finca:</strong> ${lote.finca_id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnAtras").addEventListener("click", (e) => {
      e.preventDefault();
      goTo("/lotes");
    });

    if (puedeEditar) {
      document.getElementById("btnEditar").addEventListener("click", () => {
        abrirModalEditar();
      });

      document.getElementById("btnEliminar").addEventListener("click", () => {
        abrirModalEliminar();
      });
    }
  };

  const abrirModalEditar = () => {
    Modal({
      id: "modalEditarLote",
      title: `Editar ${lote.nombre}`,
      bodyHtml: `
        <form id="formEditarLote">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" name="nombre" value="${lote.nombre}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Cultivo</label>
            <select class="form-select" name="cultivo">
              <option value="cafe" ${lote.cultivo.nombre === "Cafe" ? "selected" : ""}>Cafe</option>
              <option value="platano" ${lote.cultivo.nombre === "Platano" ? "selected" : ""}>Platano</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Hectareas</label>
            <input type="number" class="form-control" name="hectareas" step="0.01" value="${lote.hectareas}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="ACTIVO" ${lote.estado === "ACTIVO" ? "selected" : ""}>Activo</option>
              <option value="EN_DESCANSO" ${lote.estado === "EN_DESCANSO" ? "selected" : ""}>En descanso</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarLote");
        const fd = new FormData(form);
        lote.nombre = fd.get("nombre");
        lote.cultivo = { nombre: fd.get("cultivo") === "cafe" ? "Cafe" : "Platano" };
        lote.hectareas = parseFloat(fd.get("hectareas"));
        lote.estado = fd.get("estado");
        const { lotes } = store.getState();
        const idx = lotes.findIndex((l) => l.id === lote.id);
        if (idx !== -1) lotes[idx] = lote;
        store.setState({ lotes });
        render();
        showToast("Lote actualizado", "success");
      },
      confirmLabel: "Guardar cambios",
      onDelete: () => {
        if (!confirm("¿Estas seguro de eliminar este lote?")) return;
        const { lotes } = store.getState();
        lotes = lotes.filter((l) => l.id !== lote.id);
        store.setState({ lotes });
        showToast("Lote eliminado", "info");
        goTo("/lotes");
      },
      deleteLabel: "Eliminar",
    });
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarLote",
      title: "Eliminar lote",
      bodyHtml: `
        <p>¿Estas seguro de eliminar el lote <strong>${lote.nombre}</strong> (${lote.codigo_qr})?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: () => {
        const { lotes } = store.getState();
        lotes = lotes.filter((l) => l.id !== lote.id);
        store.setState({ lotes });
        showToast("Lote eliminado", "info");
        goTo("/lotes");
      },
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
