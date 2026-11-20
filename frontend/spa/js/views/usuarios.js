/* Vista: Usuarios (protegida, solo admin) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const UsuariosView = (container) => {
  let selectedId = null;

  const render = () => {
    const { user } = store.getState();
    const puedeEditar = user?.rol === "SUPERADMIN";
    const fincas = store.getState().fincas || [];
    const usuarios = store.getState().usuariosRegistrados || [];

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Gestion de Usuarios</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevoUsuario">Nuevo usuario</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
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
                      const isSel = selectedId === u.id;
                      const fincaObj = fincas.find((f) => f.id === u.finca_id);
                      const fincaNombre = fincaObj ? fincaObj.nombre : "-";
                      return `
                  <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-usuario-id="${u.id}">
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
    `;

    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-usuario-id]");
        if (tr) {
          const id = parseInt(tr.getAttribute("data-usuario-id"), 10);
          goTo(`/usuarios/${id}`);
          return;
        }
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
        abrirModalNuevo();
      });
    }
  };

  const abrirModalNuevo = () => {
    const fincas = store.getState().fincas || [];
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
            <select class="form-select" name="finca_id">
              ${fincas.map((f) => `<option value="${f.id}">${f.nombre}</option>`).join("")}
            </select>
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
          password: "auto_generado_" + Date.now(),
        };
        usuarios.push(nuevo);
        store.setState({ usuariosRegistrados: usuarios });
        render();
        showToast("Usuario creado correctamente. Contrasena generada automaticamente.", "success");
      },
      confirmLabel: "Crear",
    });

    const rolSelect = document.getElementById("rolSelect");
    const fincaGroup = document.getElementById("fincaSelectGroup");
    if (rolSelect && fincaGroup) {
      rolSelect.addEventListener("change", () => {
        fincaGroup.style.display = rolSelect.value === "MAYORDOMO" ? "block" : "none";
      });
    }
  };

  render();

  return { destroy: () => {} };
};
