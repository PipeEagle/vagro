/* Vista: Admin Usuarios (protegida, solo admin) */
import { Modal } from "../components/modal.js";
import { showToast } from "../app.js";
import store from "../store.js";

export const AdminUsuariosView = (container) => {
  /* Sincronizar datos desde el store */
  const syncState = () => {
    const state = store.getState();
    return {
      usuarios: state.usuariosRegistrados || [],
      fincas: state.fincas || [],
    };
  };

  const getUsuarios = () => syncState().usuarios;
  const getFincas = () => syncState().fincas;

  let selectedId = null;

  const render = () => {
    const { user } = store.getState();
    const puedeEditar = user?.rol === "SUPERADMIN";
    const usuarios = getUsuarios();
    const fincas = getFincas();

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Administracion de Usuarios y Fincas</h1>
          <div class="d-flex gap-2">
            ${puedeEditar ? `
              <button class="btn btn-primary" id="btnNuevoUsuario">Nuevo usuario</button>
              <button class="btn btn-primary" id="btnNuevaFinca">Nueva finca</button>
            ` : ""}
            ${selectedId ? `
              ${puedeEditar ? `<button class="btn btn-outline" id="btnEditarUsuario">Editar usuario</button>` : ""}
              ${puedeEditar && selectedId !== 1 ? `<button class="btn btn-danger" id="btnEliminarUsuario">Eliminar usuario</button>` : ""}
              ${puedeEditar ? `<button class="btn btn-outline" id="btnAsignarFinca">Asignar finca</button>` : ""}
            ` : ""}
            ${selectedId && puedeEditar ? `<button class="btn btn-danger" id="btnEliminarFinca">Eliminar finca</button>` : ""}
          </div>
        </div>

        <div class="row">
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h6 class="card-title">Usuarios</h6>
                <table class="table data-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre completo</th>
                      <th>Rol</th>
                      <th>Finca asignada</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${usuarios
                      .map(
                        (u) => {
                          const isSel = u.id === selectedId;
                          const fincaObj = fincas.find((f) => f.id === u.finca_id);
                          const fincaNombre = fincaObj ? fincaObj.nombre : "-";
                          return `
                      <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-row-key="${u.id}">
                        <td>${u.username}</td>
                        <td>${u.nombre_completo}</td>
                        <td><span class="badge bg-primary">${u.rol}</span></td>
                        <td>${fincaNombre}</td>
                        <td><span class="badge bg-success">${u.estado}</span></td>
                      </tr>
                    `;
                      }
                    )
                    .join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h6 class="card-title">Fincas</h6>
                <table class="table data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${fincas
                      .map(
                        (f) => `
                      <tr style="cursor:pointer;">
                        <td>${f.nombre}</td>
                        <td><span class="badge bg-${f.estado === "ACTIVO" ? "success" : f.estado === "EN_DESCANSO" ? "warning" : "secondary"}">${f.estado}</span></td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        ${selectedId ? `
          <div class="alert alert-info mt-3">
            Usuario seleccionado: <strong>${usuarios.find(u => u.id === selectedId)?.username}</strong> (${usuarios.find(u => u.id === selectedId)?.rol})
            ${usuarios.find(u => u.id === selectedId)?.finca_id ? `- Finca: ${fincas.find(f => f.id === usuarios.find(u => u.id === selectedId).finca_id)?.nombre}` : "- Sin finca asignada"}
          </div>
        ` : ""}
      </div>
    `;

    /* Event delegation para seleccionar usuario */
    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-row-key]");
        if (!tr) return;
        selectedId = parseInt(tr.getAttribute("data-row-key"), 10);
        render();
      });
    }

    if (puedeEditar) {
      /* Nuevo usuario */
      document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
        Modal({
          id: "modalNuevoUsuario",
          title: "Nuevo usuario",
          bodyHtml: `
            <form id="formNuevoUsuario">
              <div class="mb-3">
                <label class="form-label">Nombre y apellido</label>
                <input type="text" class="form-control" name="nombre_completo" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Usuario</label>
                <input type="text" class="form-control" name="username" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Correo electronico</label>
                <input type="email" class="form-control" name="email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Rol</label>
                <select class="form-select" name="rol" id="rolSelect">
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPERADMIN">Super administrador</option>
                  <option value="MAYORDOMO">Mayordomo</option>
                </select>
              </div>
              <div class="mb-3" id="fincaSelectGroup" style="display:none;">
                <label class="form-label">Finca asignada</label>
                <select class="form-select" name="finca_id" id="nuevoUsuarioFinca">
                  ${getFincas().map((f) => `<option value="${f.id}">${f.nombre}</option>`).join("")}
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Contrasena</label>
                <input type="password" class="form-control" name="password" required>
              </div>
            </form>
          `,
          onConfirm: () => {
            const form = document.getElementById("formNuevoUsuario");
            const fd = new FormData(form);
            const nuevo = {
              id: Date.now(),
              username: fd.get("username"),
              nombre_completo: fd.get("nombre_completo"),
              rol: fd.get("rol"),
              estado: "Activo",
              finca_id: fd.get("rol") === "MAYORDOMO" ? parseInt(fd.get("finca_id")) || null : null,
              password: fd.get("password"),
            };
            const currentUsuarios = getUsuarios();
            currentUsuarios.push(nuevo);
            store.setState({ usuariosRegistrados: currentUsuarios });
            selectedId = null;
            render();
            showToast("Usuario creado correctamente (modo simulacion)", "success");
            modal.close();
          },
          confirmLabel: "Guardar",
        });

        const rolSelect = document.getElementById("rolSelect");
        const fincaGroup = document.getElementById("fincaSelectGroup");
        if (rolSelect && fincaGroup) {
          rolSelect.addEventListener("change", () => {
            fincaGroup.style.display = rolSelect.value === "MAYORDOMO" ? "block" : "none";
          });
        }
      });

      /* Nueva finca */
      document.getElementById("btnNuevaFinca").addEventListener("click", () => {
        const mayordomosSinFinca = getUsuarios().filter(
          (u) => u.rol === "MAYORDOMO" && (!u.finca_id || u.finca_id === null)
        );
        Modal({
          id: "modalNuevaFinca",
          title: "Nueva finca",
          bodyHtml: `
            <form id="formNuevaFinca">
              <div class="mb-3">
                <label class="form-label">Nombre de la finca</label>
                <input type="text" class="form-control" name="nombre" required placeholder="Ej: Finca El Roble">
              </div>
              <div class="mb-3">
                <label class="form-label">Municipio</label>
                <input type="text" class="form-control" name="municipio" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Departamento</label>
                <input type="text" class="form-control" name="departamento" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Estado</label>
                <select class="form-select" name="estado">
                  <option value="ACTIVO">Activo</option>
                  <option value="EN_DESCANSO">En descanso</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Asignar mayordomo</label>
                <select class="form-select" name="mayordomo_id">
                  <option value="">Sin asignar (puedes asignarlo despues)</option>
                  ${mayordomosSinFinca
                    .map(
                      (m) =>
                        `<option value="${m.id}">${m.username} - ${m.nombre_completo}</option>`
                    )
                    .join("")}
                </select>
                ${mayordomosSinFinca.length === 0 ? '<div class="form-text text-muted">No hay mayordomos disponibles sin finca asignada.</div>' : ""}
              </div>
            </form>
          `,
          onConfirm: () => {
            const form = document.getElementById("formNuevaFinca");
            const fd = new FormData(form);
            const nueva = {
              id: Date.now(),
              nombre: fd.get("nombre"),
              municipio: fd.get("municipio"),
              departamento: fd.get("departamento"),
              estado: fd.get("estado"),
            };
            const currentFincas = getFincas();
            currentFincas.push(nueva);
            store.setState({ fincas: currentFincas });
            /* Asignar mayordomo si se selecciono uno */
            const mayordomoId = fd.get("mayordomo_id");
            if (mayordomoId) {
              const currentUsuarios = getUsuarios();
              const mayordomo = currentUsuarios.find((u) => u.id === parseInt(mayordomoId));
              if (mayordomo) {
                mayordomo.finca_id = nueva.id;
                store.setState({ usuariosRegistrados: currentUsuarios });
              }
            }
            render();
            showToast("Finca creada correctamente", "success");
            modal.close();
          },
          confirmLabel: "Crear",
        });
      });

      /* Asignar finca a usuario */
      if (selectedId) {
        document.getElementById("btnAsignarFinca").addEventListener("click", () => {
          const u = getUsuarios().find((u) => u.id === selectedId);
          if (!u) return;
          Modal({
            id: "modalAsignarFinca",
            title: `Asignar finca a ${u.username}`,
            bodyHtml: `
              <form id="formAsignarFinca">
                <div class="mb-3">
                  <label class="form-label">Finca</label>
                  <select class="form-select" name="finca_id" required>
                    <option value="">Sin finca</option>
                    ${getFincas().map((f) => `<option value="${f.id}" ${u.finca_id === f.id ? "selected" : ""}>${f.nombre}</option>`).join("")}
                  </select>
                </div>
              </form>
            `,
            onConfirm: () => {
              const form = document.getElementById("formAsignarFinca");
              const fd = new FormData(form);
              const currentUsuarios = getUsuarios();
              const uIndex = currentUsuarios.findIndex((uu) => uu.id === selectedId);
              if (uIndex !== -1) {
                currentUsuarios[uIndex].finca_id = fd.get("finca_id") ? parseInt(fd.get("finca_id")) : null;
                store.setState({ usuariosRegistrados: currentUsuarios });
              }
              render();
              showToast("Finca asignada correctamente", "success");
              modal.close();
            },
            confirmLabel: "Asignar",
          });
        });
      }

      /* Editar usuario */
      if (selectedId) {
        document.getElementById("btnEditarUsuario").addEventListener("click", () => {
          const u = getUsuarios().find((u) => u.id === selectedId);
          if (!u) return;
          Modal({
            id: "modalEditarUsuario",
            title: "Editar usuario",
            bodyHtml: `
              <form id="formEditarUsuario">
                <div class="mb-3">
                  <label class="form-label">Nombre y apellido</label>
                  <input type="text" class="form-control" name="nombre_completo" value="${u.nombre_completo}" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Usuario</label>
                  <input type="text" class="form-control" name="username" value="${u.username}" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Rol</label>
                  <select class="form-select" name="rol">
                    <option value="ADMIN" ${u.rol === "ADMIN" ? "selected" : ""}>Administrador</option>
                    <option value="SUPERADMIN" ${u.rol === "SUPERADMIN" ? "selected" : ""}>Super administrador</option>
                    <option value="MAYORDOMO" ${u.rol === "MAYORDOMO" ? "selected" : ""}>Mayordomo</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Estado</label>
                  <select class="form-select" name="estado">
                    <option value="Activo" ${u.estado === "Activo" ? "selected" : ""}>Activo</option>
                    <option value="Inactivo" ${u.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
                  </select>
                </div>
              </form>
            `,
            onConfirm: () => {
              const form = document.getElementById("formEditarUsuario");
              const fd = new FormData(form);
              const currentUsuarios = getUsuarios();
              const uIndex = currentUsuarios.findIndex((uu) => uu.id === selectedId);
              if (uIndex !== -1) {
                currentUsuarios[uIndex].nombre_completo = fd.get("nombre_completo");
                currentUsuarios[uIndex].username = fd.get("username");
                currentUsuarios[uIndex].rol = fd.get("rol");
                currentUsuarios[uIndex].estado = fd.get("estado");
                store.setState({ usuariosRegistrados: currentUsuarios });
              }
              render();
              showToast("Usuario actualizado", "success");
              modal.close();
            },
            confirmLabel: "Guardar",
          });
        });

        /* Eliminar usuario */
        document.getElementById("btnEliminarUsuario").addEventListener("click", () => {
          if (!confirm("¿Estas seguro de eliminar este usuario?")) return;
          if (selectedId === 1) {
            showToast("No se puede eliminar el administrador principal", "error");
            return;
          }
          const currentUsuarios = getUsuarios().filter((u) => u.id !== selectedId);
          store.setState({ usuariosRegistrados: currentUsuarios });
          selectedId = null;
          render();
          showToast("Usuario eliminado", "info");
        });

        /* Eliminar finca */
        document.getElementById("btnEliminarFinca").addEventListener("click", () => {
          const f = getFincas().find((f) => f.id === selectedId);
          if (!f) return;
          if (!confirm(`¿Estas seguro de eliminar la finca ${f.nombre}?`)) return;
          /* Desasignar finca de usuarios */
          const currentUsuarios = getUsuarios();
          currentUsuarios.forEach((u) => {
            if (u.finca_id === f.id) u.finca_id = null;
          });
          store.setState({ usuariosRegistrados: currentUsuarios });
          const currentFincas = getFincas().filter((f) => f.id !== selectedId);
          store.setState({ fincas: currentFincas });
          selectedId = null;
          render();
          showToast("Finca eliminada", "info");
        });
      }
    }
  };

  render();

  return { destroy: () => {} };
};
