/* Vista: FincaDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const FincaDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar = user?.rol === "SUPERADMIN";

  let finca = null;

  const render = () => {
    const { fincas } = store.getState();
    finca = fincas.find((f) => f.id === parseInt(id));
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
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnAtras").addEventListener("click", (e) => {
      e.preventDefault();
      goTo("/fincas");
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
            <select class="form-select" name="estado">
              <option value="ACTIVO" ${finca.estado === "ACTIVO" ? "selected" : ""}>Activo</option>
              <option value="EN_DESCANSO" ${finca.estado === "EN_DESCANSO" ? "selected" : ""}>En descanso</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarFinca");
        const fd = new FormData(form);
        finca.nombre = fd.get("nombre");
        finca.municipio = fd.get("municipio");
        finca.departamento = fd.get("departamento");
        finca.estado = fd.get("estado");
        store.setState({ fincas });
        render();
        showToast("Finca actualizada", "success");
      },
      confirmLabel: "Guardar cambios",
      onDelete: () => {
        if (!confirm("¿Estas seguro de eliminar esta finca?")) return;
        const currentUsuarios = store.getState().usuariosRegistrados || [];
        currentUsuarios.forEach((u) => {
          if (u.finca_id === finca.id) u.finca_id = null;
        });
        store.setState({ usuariosRegistrados: currentUsuarios });
        fincas = fincas.filter((f) => f.id !== finca.id);
        store.setState({ fincas });
        showToast("Finca eliminada", "info");
        goTo("/fincas");
      },
      deleteLabel: "Eliminar",
    });
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarFinca",
      title: "Eliminar finca",
      bodyHtml: `
        <p>¿Estas seguro de eliminar la finca <strong>${finca.nombre}</strong>?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: () => {
        const currentUsuarios = store.getState().usuariosRegistrados || [];
        currentUsuarios.forEach((u) => {
          if (u.finca_id === finca.id) u.finca_id = null;
        });
        store.setState({ usuariosRegistrados: currentUsuarios });
        fincas = fincas.filter((f) => f.id !== finca.id);
        store.setState({ fincas });
        showToast("Finca eliminada", "info");
        goTo("/fincas");
      },
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
