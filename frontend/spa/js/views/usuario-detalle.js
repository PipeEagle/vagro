/* Vista: UsuarioDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const UsuarioDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar = user?.rol === "SUPERADMIN";
  const fincas = store.getState().fincas || [];

  let usuario = null;

  const render = () => {
    const { usuariosRegistrados } = store.getState();
    usuario = usuariosRegistrados.find((u) => u.id === parseInt(id));
    if (!usuario) {
      container.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-1 fw-bold">404</h1>
            <p class="lead text-muted">Usuario no encontrado</p>
            <a href="/usuarios" class="btn btn-primary" data-router>Volver a usuarios</a>
          </div>
        </div>
      `;
      return;
    }

    const fincaObj = fincas.find((f) => f.id === usuario.finca_id);

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-secondary" id="btnAtras" data-router>Atras</button>
          <h2>Detalle de usuario</h2>
          <div class="d-flex gap-2">
            ${puedeEditar ? `<button class="btn btn-outline" id="btnEditar">Editar</button>` : ""}
            ${puedeEditar && usuario.id !== 1 ? `<button class="btn btn-danger" id="btnEliminar">Eliminar</button>` : ""}
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Informacion del usuario</h5>
                <p><strong>Usuario:</strong> ${usuario.username}</p>
                <p><strong>Nombre completo:</strong> ${usuario.nombre_completo}</p>
                <p><strong>Rol:</strong> <span class="badge bg-primary">${usuario.rol}</span></p>
                <p><strong>Estado:</strong> <span class="badge bg-success">${usuario.estado}</span></p>
                <p><strong>Finca asignada:</strong> ${fincaObj ? fincaObj.nombre : "- Sin asignar -"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btnAtras").addEventListener("click", (e) => {
      e.preventDefault();
      goTo("/usuarios");
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
    const fincas = store.getState().fincas || [];
    Modal({
      id: "modalEditarUsuario",
      title: "Editar usuario",
      bodyHtml: `
        <form id="formEditarUsuario">
          <div class="mb-3">
            <label class="form-label">Nombre y apellido</label>
            <input type="text" class="form-control" name="nombre_completo" value="${usuario.nombre_completo}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Usuario</label>
            <input type="text" class="form-control" name="username" value="${usuario.username}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Rol</label>
            <select class="form-select" name="rol">
              <option value="ADMIN" ${usuario.rol === "ADMIN" ? "selected" : ""}>Administrador</option>
              <option value="SUPERADMIN" ${usuario.rol === "SUPERADMIN" ? "selected" : ""}>Super administrador</option>
              <option value="MAYORDOMO" ${usuario.rol === "MAYORDOMO" ? "selected" : ""}>Mayordomo</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select class="form-select" name="estado">
              <option value="Activo" ${usuario.estado === "Activo" ? "selected" : ""}>Activo</option>
              <option value="Inactivo" ${usuario.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formEditarUsuario");
        const fd = new FormData(form);
        const currentUsuarios = store.getState().usuariosRegistrados || [];
        const uIndex = currentUsuarios.findIndex((u) => u.id === usuario.id);
        if (uIndex !== -1) {
          currentUsuarios[uIndex].nombre_completo = fd.get("nombre_completo");
          currentUsuarios[uIndex].username = fd.get("username");
          currentUsuarios[uIndex].rol = fd.get("rol");
          currentUsuarios[uIndex].estado = fd.get("estado");
          store.setState({ usuariosRegistrados: currentUsuarios });
        }
        render();
        showToast("Usuario actualizado", "success");
      },
      confirmLabel: "Guardar cambios",
      onDelete: () => {
        if (usuario.id === 1) {
          showToast("No se puede eliminar el administrador principal", "error");
          return;
        }
        if (!confirm("¿Estas seguro de eliminar este usuario?")) return;
        const currentUsuarios = store.getState().usuariosRegistrados || [];
        currentUsuarios = currentUsuarios.filter((u) => u.id !== usuario.id);
        store.setState({ usuariosRegistrados: currentUsuarios });
        showToast("Usuario eliminado", "info");
        goTo("/usuarios");
      },
      deleteLabel: "Eliminar",
    });
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarUsuario",
      title: "Eliminar usuario",
      bodyHtml: `
        <p>¿Estas seguro de eliminar el usuario <strong>${usuario.username}</strong>?</p>
        ${usuario.id === 1 ? '<p class="text-danger">No se puede eliminar el administrador principal.</p>' : ""}
      `,
      onDelete: () => {
        if (usuario.id === 1) {
          showToast("No se puede eliminar el administrador principal", "error");
          return;
        }
        const currentUsuarios = store.getState().usuariosRegistrados || [];
        currentUsuarios = currentUsuarios.filter((u) => u.id !== usuario.id);
        store.setState({ usuariosRegistrados: currentUsuarios });
        showToast("Usuario eliminado", "info");
        goTo("/usuarios");
      },
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
