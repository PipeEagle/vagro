/* Vista: Fincas (protegida, solo admin) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const FincasView = (container) => {
  let selectedId = null;

  const render = () => {
    const { user, fincas } = store.getState();
    const puedeEditar = user?.rol === "SUPERADMIN";

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Gestion de Fincas</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevaFinca">Nueva finca</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Municipio</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${fincas
                  .map(
                    (f) => {
                      const isSel = selectedId === f.id;
                      return `
                  <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-finca-id="${f.id}">
                    <td>${f.nombre}</td>
                    <td>${f.municipio}</td>
                    <td>${f.departamento}</td>
                    <td><span class="badge bg-${f.estado === "ACTIVO" ? "success" : f.estado === "EN_DESCANSO" ? "warning" : "secondary"}">${f.estado}</span></td>
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
        const tr = e.target.closest("tr[data-finca-id]");
        if (!tr) return;
        const id = parseInt(tr.getAttribute("data-finca-id"), 10);
        goTo(`/fincas/${id}`);
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevaFinca").addEventListener("click", () => {
        abrirModalNueva();
      });
    }
  };

  const abrirModalNueva = () => {
    const usuarios = store.getState().usuariosRegistrados || [];
    const mayordomosSinFinca = usuarios.filter(
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
        fincas.push(nueva);
        store.setState({ fincas });
        const mayordomoId = fd.get("mayordomo_id");
        if (mayordomoId) {
          const currentUsuarios = store.getState().usuariosRegistrados || [];
          const mayordomo = currentUsuarios.find((u) => u.id === parseInt(mayordomoId));
          if (mayordomo) {
            mayordomo.finca_id = nueva.id;
            store.setState({ usuariosRegistrados: currentUsuarios });
          }
        }
        render();
        showToast("Finca creada correctamente", "success");
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
