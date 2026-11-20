/* Vista: Insumos (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo } from "../app.js";

export const InsumosView = (container) => {
  let selectedId = null;
  let insumos = store.getState().insumos;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    insumos = store.getState().insumos;

    let insumosFiltrados = insumos;
    if (user?.rol === "MAYORDOMO") {
      insumosFiltrados = insumos.filter((i) => i.finca_id === user.finca_id);
    } else if (fincaSeleccionada) {
      insumosFiltrados = insumos.filter((i) => i.finca_id === fincaSeleccionada);
    }

    const puedeEditar =
      user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Catalogo de Insumos</h1>
          ${puedeEditar ? `<button class="btn btn-primary" id="btnNuevoInsumo">Nuevo insumo</button>` : ""}
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <table class="table data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Ingrediente activo</th>
                  <th>Carencia</th>
                  <th>Unidad</th>
                </tr>
              </thead>
              <tbody>
                ${insumosFiltrados
                  .map(
                    (ins) => {
                      const isSel = selectedId === ins.id;
                      return `
                  <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-insumo-id="${ins.id}">
                    <td>${ins.nombre}</td>
                    <td>${ins.tipo}</td>
                    <td>${ins.ingrediente}</td>
                    <td>${ins.carencia}</td>
                    <td>${ins.unidad}</td>
                  </tr>
                `;
                    }
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        ${insumosFiltrados.length === 0 ? `
          <div class="text-center py-4 text-muted">No hay insumos registrados para esta finca.</div>
        ` : ""}
      </div>
    `;

    const tbody = container.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-insumo-id]");
        if (!tr) return;
        const id = parseInt(tr.getAttribute("data-insumo-id"), 10);
        goTo(`/insumos/${id}`);
      });
    }

    if (puedeEditar) {
      document.getElementById("btnNuevoInsumo").addEventListener("click", () => {
        abrirModalNuevo();
      });
    }
  };

  const abrirModalNuevo = () => {
    Modal({
      id: "modalNuevoInsumo",
      title: "Nuevo insumo",
      bodyHtml: `
        <form id="formNuevoInsumo">
          <div class="mb-3">
            <label class="form-label">Nombre comercial</label>
            <input type="text" class="form-control" name="nombre" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Tipo</label>
            <select class="form-select" name="tipo">
              <option value="fertilizante">Fertilizante</option>
              <option value="fungicida">Fungicida</option>
              <option value="insecticida">Insecticida</option>
              <option value="enmienda">Enmienda</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Ingrediente activo</label>
            <input type="text" class="form-control" name="ingrediente">
          </div>
          <div class="mb-3">
            <label class="form-label">Periodo de carencia (dias)</label>
            <input type="number" class="form-control" name="carencia">
          </div>
          <div class="mb-3">
            <label class="form-label">Unidad</label>
            <select class="form-select" name="unidad">
              <option value="kg">kg</option>
              <option value="L">L</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: () => {
        const form = document.getElementById("formNuevoInsumo");
        const fd = new FormData(form);
        const { fincaSeleccionada, user } = store.getState();
        const nuevo = {
          id: Date.now(),
          finca_id: fincaSeleccionada || user?.finca_id || 1,
          nombre: fd.get("nombre"),
          tipo: fd.get("tipo"),
          ingrediente: fd.get("ingrediente"),
          carencia: fd.get("carencia") || "-",
          unidad: fd.get("unidad"),
        };
        insumos.push(nuevo);
        store.setState({ insumos });
        render();
        showToast("Insumo creado correctamente", "success");
      },
      confirmLabel: "Crear",
    });
  };

  render();

  return { destroy: () => {} };
};
