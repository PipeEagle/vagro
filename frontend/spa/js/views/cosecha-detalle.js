/* Vista: CosechaDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const CosechaDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar =
    user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

  let cosecha = null;

  const render = () => {
    const { cosechas } = store.getState();
    cosecha = cosechas.find((c) => c.id === parseInt(id));
    if (!cosecha) {
      container.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-1 fw-bold">404</h1>
            <p class="lead text-muted">Cosecha no encontrada</p>
            <a href="/cosechas" class="btn btn-primary" data-router>Volver a cosechas</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-secondary" id="btnAtras" data-router>Atras</button>
          <h2>Detalle de cosecha</h2>
          <div class="d-flex gap-2">
            ${puedeEditar ? `<button class="btn btn-outline" id="btnEditar">Editar</button>` : ""}
            ${puedeEditar ? `<button class="btn btn-danger" id="btnEliminar">Eliminar</button>` : ""}
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Informacion de la cosecha</h5>
                <p><strong>Lote:</strong> ${cosecha.lote_codigo_qr}</p>
                <p><strong>Fecha:</strong> ${cosecha.fecha}</p>
                <p><strong>Cantidad:</strong> ${cosecha.cantidad}</p>
                <p><strong>Unidad:</strong> ${cosecha.unidad}</p>
                <p><strong>Calidad:</strong> ${cosecha.calidad}</p>
                <p><strong>Estado:</strong> ${StatusBadge({ estado: cosecha.estado, tipo: "estado" })}</p>
                <p><strong>Finca:</strong> ${cosecha.finca_id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnAtras").addEventListener("click", (e) => {
      e.preventDefault();
      goTo("/cosechas");
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
      id: "modalEditarCosecha",
      title: "Editar cosecha",
      bodyHtml: `
        <form id="formEditarCosecha">
          <div class="mb-3">
            <label class="form-label">Cantidad</label>
            <input type="number" class="form-control" name="cantidad" value="${cosecha.cantidad}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Calidad</label>
            <select class="form-select" name="calidad">
              <option value="Primera" ${cosecha.calidad === "Primera" ? "selected" : ""}>Primera</option>
              <option value="Segunda" ${cosecha.calidad === "Segunda" ? "selected" : ""}>Segunda</option>
              <option value="Rechazo" ${cosecha.calidad === "Rechazo" ? "selected" : ""}>Rechazo</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="Programada" ${cosecha.estado === "Programada" ? "selected" : ""}>Programada</option>
              <option value="Completada" ${cosecha.estado === "Completada" ? "selected" : ""}>Completada</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarCosecha");
        const fd = new FormData(form);
        cosecha.cantidad = parseFloat(fd.get("cantidad"));
        cosecha.calidad = fd.get("calidad");
        cosecha.estado = fd.get("estado");
        const { cosechas } = store.getState();
        const idx = cosechas.findIndex((c) => c.id === cosecha.id);
        if (idx !== -1) cosechas[idx] = cosecha;
        store.setState({ cosechas });
        render();
        showToast("Cosecha actualizada", "success");
      },
      confirmLabel: "Guardar cambios",
      onDelete: () => {
        if (!confirm("¿Estas seguro de eliminar esta cosecha?")) return;
        const { cosechas } = store.getState();
        cosechas = cosechas.filter((c) => c.id !== cosecha.id);
        store.setState({ cosechas });
        showToast("Cosecha eliminada", "info");
        goTo("/cosechas");
      },
      deleteLabel: "Eliminar",
    });
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarCosecha",
      title: "Eliminar cosecha",
      bodyHtml: `
        <p>¿Estas seguro de eliminar la cosecha del lote <strong>${cosecha.lote_codigo_qr}</strong>?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: () => {
        const { cosechas } = store.getState();
        cosechas = cosechas.filter((c) => c.id !== cosecha.id);
        store.setState({ cosechas });
        showToast("Cosecha eliminada", "info");
        goTo("/cosechas");
      },
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
