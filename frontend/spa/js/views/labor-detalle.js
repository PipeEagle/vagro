/* Vista: LaborDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const LaborDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar =
    user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

  let labor = null;

  const render = () => {
    const { labores } = store.getState();
    labor = labores.find((l) => l.id === parseInt(id));
    if (!labor) {
      container.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-1 fw-bold">404</h1>
            <p class="lead text-muted">Labor no encontrada</p>
            <a href="/labores" class="btn btn-primary" data-router>Volver a labores</a>
          </div>
        </div>
      `;
      return;
    }

    const tipoLabels = {
      fertilizacion: "Fertilizacion",
      fumigacion: "Fumigacion",
      poda: "Poda",
      cosecha: "Cosecha",
      riego: "Riego",
      siembra: "Siembra",
    };

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-secondary" id="btnAtras" data-router>Atras</button>
          <h2>Detalle de labor</h2>
          <div class="d-flex gap-2">
            ${puedeEditar ? `<button class="btn btn-outline" id="btnEditar">Editar</button>` : ""}
            ${puedeEditar ? `<button class="btn btn-danger" id="btnEliminar">Eliminar</button>` : ""}
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Informacion de la labor</h5>
                <p><strong>Lote:</strong> ${labor.lote_codigo_qr}</p>
                <p><strong>Tipo:</strong> ${tipoLabels[labor.tipo] || labor.tipo}</p>
                <p><strong>Fecha:</strong> ${labor.fecha}</p>
                <p><strong>Estado:</strong> ${StatusBadge({ estado: labor.estado, tipo: "estado" })}</p>
                <p><strong>Finca:</strong> ${labor.finca_id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const { returnTo } = store.getState();
    const rutaAtras = returnTo || "/labores";

    document.getElementById("btnAtras").addEventListener("click", (e) => {
      e.preventDefault();
      goTo(rutaAtras);
      store.setState({ returnTo: null });
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
      id: "modalEditarLabor",
      title: `Editar labor`,
      bodyHtml: `
        <form id="formEditarLabor">
          <div class="mb-3">
            <label class="form-label">Tipo de labor</label>
            <select class="form-select" name="tipo">
              <option value="fertilizacion" ${labor.tipo === "fertilizacion" ? "selected" : ""}>Fertilizacion</option>
              <option value="fumigacion" ${labor.tipo === "fumigacion" ? "selected" : ""}>Fumigacion</option>
              <option value="poda" ${labor.tipo === "poda" ? "selected" : ""}>Poda</option>
              <option value="cosecha" ${labor.tipo === "cosecha" ? "selected" : ""}>Cosecha</option>
              <option value="riego" ${labor.tipo === "riego" ? "selected" : ""}>Riego</option>
              <option value="siembra" ${labor.tipo === "siembra" ? "selected" : ""}>Siembra</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-control" name="fecha" value="${labor.fecha}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="Programada" ${labor.estado === "Programada" ? "selected" : ""}>Programada</option>
              <option value="Pendiente" ${labor.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
              <option value="Completada" ${labor.estado === "Completada" ? "selected" : ""}>Completada</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarLabor");
        const fd = new FormData(form);
        labor.tipo = fd.get("tipo");
        labor.fecha = fd.get("fecha");
        labor.estado = fd.get("estado");
        const { labores } = store.getState();
        const idx = labores.findIndex((l) => l.id === labor.id);
        if (idx !== -1) labores[idx] = labor;
        store.setState({ labores });
        render();
        showToast("Labor actualizada", "success");
      },
      confirmLabel: "Guardar cambios",
      onDelete: () => {
        if (!confirm("¿Estas seguro de eliminar esta labor?")) return;
        const { labores } = store.getState();
        labores = labores.filter((l) => l.id !== labor.id);
        store.setState({ labores });
        showToast("Labor eliminada", "info");
        goTo("/labores");
      },
      deleteLabel: "Eliminar",
    });
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarLabor",
      title: "Eliminar labor",
      bodyHtml: `
        <p>¿Estas seguro de eliminar la labor <strong>${labor.tipo}</strong> del lote <strong>${labor.lote_codigo_qr}</strong>?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: () => {
        const { labores } = store.getState();
        labores = labores.filter((l) => l.id !== labor.id);
        store.setState({ labores });
        showToast("Labor eliminada", "info");
        goTo("/labores");
      },
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
