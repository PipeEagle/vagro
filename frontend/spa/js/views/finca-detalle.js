/* Vista: FincaDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const FincaDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar = user?.rol === "SUPERADMIN";

  let finca = null;

  const render = () => {
    const { fincas, usuariosRegistrados } = store.getState();
    finca = fincas.find((f) => f.id === parseInt(id));
    if (finca) {
      const mayordomo = usuariosRegistrados.find((u) => u.finca_id === finca.id);
      finca.mayordomo_nombre = mayordomo ? mayordomo.username : null;
    }
    if (!finca) {
      container.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-1 fw-bold">404</h1>
            <p class="lead text-muted">Finca no encontrada</p>
            <a href="/fincas" class="btn btn-primary" data-router>Volver a fincas</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-secondary" id="btnAtras" data-router>Atras</button>
          <h2>Detalle de finca</h2>
          <div class="d-flex gap-2">
            ${puedeEditar ? `<button class="btn btn-outline" id="btnEditar">Editar</button>` : ""}
            ${puedeEditar ? `<button class="btn btn-danger" id="btnEliminar">Eliminar</button>` : ""}
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Informacion de la finca</h5>
                <p><strong>Nombre:</strong> ${finca.nombre}</p>
                <p><strong>Municipio:</strong> ${finca.municipio}</p>
                <p><strong>Departamento:</strong> ${finca.departamento}</p>
                <p><strong>Estado:</strong> <span class="badge bg-${finca.estado === "ACTIVO" ? "success" : finca.estado === "EN_DESCANSO" ? "warning" : "secondary"}">${finca.estado}</span></p>
                <p><strong>Mayordomo:</strong> ${finca.mayordomo_nombre || "-"}</p>
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
        goTo("/fincas");
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
    const { usuariosRegistrados } = store.getState();
    const mayordomoActual = usuariosRegistrados.find((u) => u.finca_id === finca.id);
    const mayordomosDisponibles = usuariosRegistrados.filter(
      (u) => u.rol === "MAYORDOMO" && (!u.finca_id || u.finca_id === null || u.id === mayordomoActual?.id)
    );

    Modal({
      id: "modalEditarFinca",
      title: `Editar ${finca.nombre}`,
      bodyHtml: `
        <form id="formEditarFinca">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" name="nombre" value="${finca.nombre}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Municipio</label>
            <input type="text" class="form-control" name="municipio" value="${finca.municipio}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Departamento</label>
            <input type="text" class="form-control" name="departamento" value="${finca.departamento}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado" required>
              <option value="ACTIVO" ${finca.estado === "ACTIVO" ? "selected" : ""}>Activo</option>
              <option value="EN_DESCANSO" ${finca.estado === "EN_DESCANSO" ? "selected" : ""}>En descanso</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Asignar mayordomo</label>
            <select class="form-select" name="mayordomo_id">
              <option value="">Sin asignar</option>
              ${mayordomosDisponibles
                .map(
                  (m) =>
                    `<option value="${m.id}" ${mayordomoActual && m.id === mayordomoActual.id ? "selected" : ""}>${m.username} - ${m.nombre_completo}</option>`
                )
                .join("")}
            </select>
            ${mayordomosDisponibles.length === 0 ? '<div class="form-text text-muted">No hay mayordomos disponibles.</div>' : ""}
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarFinca");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["nombre", "municipio", "departamento"])) return false;
        finca.nombre = fd.get("nombre");
        finca.municipio = fd.get("municipio");
        finca.departamento = fd.get("departamento");
        finca.estado = fd.get("estado");

        // Desasignar mayordomo anterior si se cambia
        const nuevoMayordomoId = fd.get("mayordomo_id");
        if (mayordomoActual && mayordomoActual.id !== parseInt(nuevoMayordomoId)) {
          mayordomoActual.finca_id = null;
        }

        // Asignar nuevo mayordomo
        if (nuevoMayordomoId) {
          const mayordomo = usuariosRegistrados.find((u) => u.id === parseInt(nuevoMayordomoId));
          if (mayordomo) {
            mayordomo.finca_id = finca.id;
          }
        }

        store.setState({ fincas, usuariosRegistrados });
        render();
        showToast("Finca actualizada", "success");
      },
      confirmLabel: "Guardar cambios",
    });
  };

  const eliminarFinca = async () => {
    try {
      await apiClient.delete(`/api/fincas/${finca.id}`);
    } catch (error) {
      showToast(error.message || "Error al eliminar la finca", "danger");
      return false;
    }

    const { fincas: currentFincas = [], usuariosRegistrados = [] } = store.getState();
    store.setState({
      fincas: currentFincas.filter((item) => item.id !== finca.id),
      usuariosRegistrados: usuariosRegistrados.map((usuario) =>
        usuario.finca_id === finca.id ? { ...usuario, finca_id: null } : usuario
      ),
    });
    showToast("Finca eliminada", "success");
    goTo("/fincas");
    return true;
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarFinca",
      title: "Eliminar finca",
      bodyHtml: `
        <p>¿Estas seguro de eliminar la finca <strong>${finca.nombre}</strong>?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: eliminarFinca,
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
