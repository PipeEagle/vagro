/* Vista: LaborDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { StatusBadge } from "../components/status-badge.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

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

    document.getElementById("btnAtras").addEventListener("click", (e) => {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        goTo("/labores");
      }
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
    const hoy = new Date().toISOString().split("T")[0];
    const fechaMinima = labor.fecha < hoy ? labor.fecha : hoy;
    Modal({
      id: "modalEditarLabor",
      title: `Editar labor`,
      bodyHtml: `
        <form id="formEditarLabor">
          <div class="mb-3">
            <label class="form-label">Tipo de labor</label>
            <select class="form-select" name="tipo" required>
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
            <input type="date" class="form-control" name="fecha" value="${labor.fecha}" required min="${fechaMinima}">
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado" required>
              <option value="Pendiente" ${labor.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
              <option value="Por confirmar" ${labor.estado === "Por confirmar" ? "selected" : ""}>Por confirmar</option>
              <option value="Completada" ${labor.estado === "Completada" ? "selected" : ""}>Completada</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarLabor");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["tipo", "fecha", "estado"])) return false;
        const fechaLabor = fd.get("fecha");
        const hoy = new Date().toISOString().split("T")[0];
        const estadoNuevo = fd.get("estado");
        /* Solo bloquear fechas pasadas si el usuario cambia la fecha a una anterior. */
        if (fechaLabor !== labor.fecha && fechaLabor < hoy) {
          alert("No se pueden programar labores para fechas anteriores a hoy.");
          return false;
        }
        /* Si la fecha es pasada, solo se permite estado Completada. */
        if (fechaLabor < hoy && estadoNuevo !== "Completada") {
          alert("Una labor con fecha pasada solo puede estar en estado Completada.");
          return false;
        }
        labor.tipo = fd.get("tipo");
        labor.fecha = fd.get("fecha");
        labor.estado = fd.get("estado");
        const { labores, eventos } = store.getState();
        const idx = labores.findIndex((l) => l.id === labor.id);
        if (idx !== -1) labores[idx] = labor;

        /* Sincronizar estado con el array de eventos del calendario */
        const estadoCalendario =
          labor.estado === "Completada" ? "Realizada" : labor.estado;
        const eventosActualizados = eventos.map((e) => {
          if (
            e.fecha === labor.fecha &&
            e.tipo === labor.tipo &&
            e.finca_id === labor.finca_id
          ) {
            return { ...e, estado: estadoCalendario };
          }
          return e;
        });

        store.setState({ labores, eventos: eventosActualizados });
        render();
        showToast("Labor actualizada", "success");
      },
      confirmLabel: "Guardar cambios",
    });
  };

  const eliminarLabor = async () => {
    const { labores = [], eventos = [] } = store.getState();
    try {
      await apiClient.delete(`/api/labores/${labor.id}`);
    } catch (error) {
      showToast(error.message || "Error al eliminar la labor", "danger");
      return false;
    }

    const eventoRelacionado = eventos.find(
      (evento) =>
        evento.fecha === labor.fecha &&
        evento.tipo === labor.tipo &&
        evento.finca_id === labor.finca_id &&
        evento.titulo === `${labor.tipo} - ${labor.lote_codigo_qr}`
    );
    const resultadosEventos = await Promise.allSettled(
      eventoRelacionado
        ? [apiClient.delete(`/api/eventos/${eventoRelacionado.id}`)]
        : []
    );
    const eventosEliminados = new Set(
      resultadosEventos[0]?.status === "fulfilled" ? [eventoRelacionado.id] : []
    );
    const hayEventosFallidos = resultadosEventos.some(
      (resultado) => resultado.status === "rejected"
    );

    store.setState({
      labores: labores.filter((item) => item.id !== labor.id),
      eventos: eventos.filter((evento) => !eventosEliminados.has(evento.id)),
    });
    showToast(
      hayEventosFallidos
        ? "Labor eliminada; no se pudieron eliminar todos sus eventos del calendario."
        : "Labor eliminada",
      hayEventosFallidos ? "warning" : "success"
    );
    goTo("/labores");
    return true;
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarLabor",
      title: "Eliminar labor",
      bodyHtml: `
        <p>¿Estas seguro de eliminar la labor <strong>${labor.tipo}</strong> del lote <strong>${labor.lote_codigo_qr}</strong>?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: eliminarLabor,
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
