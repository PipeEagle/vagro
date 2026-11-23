/* Vista: Usuarios (protegida, solo admin) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const UsuariosView = (container) => {
  let selectedId = null;

  const render = () => {
    const { user } = store.getState();
    const fincasList = store.getState().fincas || [];
    const usuariosState = store.getState().usuariosRegistrados;
    const usuariosList = Array.isArray(usuariosState) ? usuariosState : [];
    const puedeEditar = user?.rol === "SUPERADMIN";

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
                ${usuariosList.length > 0
                  ? usuariosList
                      .map(
                        (u) => {
                          const isSel = selectedId === u.id;
                          const fincaObj = fincasList.find((f) => f.id === u.finca_id);
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
                      .join("")
                  : '<tr><td colspan="5" class="text-center text-muted py-3">No hay usuarios registrados.</td></tr>'}
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

  const abrirModalNuevo = async () => {
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
            <select class="form-select" name="rol" id="rolSelect" required>
              <option value="ADMIN">Administrador</option>
              <option value="SUPERADMIN">Super administrador</option>
              <option value="MAYORDOMO">Mayordomo</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formNuevoUsuario");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["nombre_completo", "username", "email", "rol"])) return false;

        const rol = fd.get("rol");

        try {
          const nuevo = await apiClient.post("/api/usuarios", {
            username: fd.get("username"),
            password: fd.get("username") + "123!",
            nombre_completo: fd.get("nombre_completo"),
            rol: rol,
            finca_id: null,
            estado: "Activo",
          });

          const { usuariosRegistrados } = store.getState();
          store.setState({ usuariosRegistrados: [...usuariosRegistrados, nuevo] });

          render();
          showToast("Usuario creado correctamente. Contrasena: " + fd.get("username") + "123!", "success");
        } catch (e) {
          showToast(e.message || "Error al crear el usuario", "danger");
          return false;
        }
        return true;
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
