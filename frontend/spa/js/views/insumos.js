/* Vista: Insumos (protegida) - Tabla limpia -> clic en fila abre detalle */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const InsumosView = (container) => {
  let selectedId = null;

  const render = () => {
    const { fincaSeleccionada, user } = store.getState();
    const insumos = store.getState().insumos || [];

    let insumosFiltrados = insumos;
    if (user?.rol === "MAYORDOMO" && user.finca_id) {
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
                  <th>Cantidad</th>
                  <th>Unidad</th>
                </tr>
              </thead>
              <tbody>
                ${insumosFiltrados.length > 0
                  ? insumosFiltrados
                      .map(
                        (ins) => {
                          const isSel = selectedId === ins.id;
                          return `
                    <tr class="${isSel ? "table-primary" : ""}" style="cursor:pointer;" data-insumo-id="${ins.id}">
                      <td>${ins.nombre}</td>
                      <td>${ins.tipo}</td>
                      <td>${ins.ingrediente || "-"}</td>
                      <td>${ins.carencia || "-"}</td>
                      <td>${ins.cantidad == null ? "Sin registrar" : Number(ins.cantidad).toLocaleString("es-CO")}</td>
                      <td>${ins.unidad}</td>
                    </tr>
                  `;
                        }
                      )
                      .join("")
                  : '<tr><td colspan="6" class="text-center text-muted py-3">No hay insumos registrados.</td></tr>'}
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

  const abrirModalNuevo = async () => {
    const { fincaSeleccionada, user } = store.getState();
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
            <select class="form-select" name="tipo" required>
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
            <input type="number" class="form-control" name="carencia" min="0">
          </div>
          <div class="mb-3">
            <label class="form-label">Cantidad disponible</label>
            <input type="number" class="form-control" name="cantidad" min="0" step="0.01" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Unidad</label>
            <select class="form-select" name="unidad" required>
              <option value="kg">kg</option>
              <option value="L">L</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formNuevoInsumo");
        const fd = new FormData(form);
        if (!validateRequired(fd, ["nombre", "tipo", "cantidad"])) return false;
        const cantidad = Number(fd.get("cantidad"));
        if (!Number.isFinite(cantidad) || cantidad < 0) {
          showToast("La cantidad debe ser un numero igual o mayor que cero.", "danger");
          return false;
        }
        const carencia = fd.get("carencia");
        if (carencia !== "" && carencia !== null && parseFloat(carencia) < 0) {
          alert("El periodo de carencia no puede ser negativo.");
          return false;
        }

        const fincaId =
          fincaSeleccionada || user?.finca_id || store.getDefaultFincaId();
        if (!fincaId) {
          showToast("No hay fincas disponibles para asignar el insumo.", "danger");
          return false;
        }

        try {
          const nuevo = await apiClient.post("/api/insumos", {
            finca_id: fincaId,
            nombre: fd.get("nombre"),
            tipo: fd.get("tipo"),
            ingrediente: fd.get("ingrediente") || null,
            carencia: fd.get("carencia") || null,
            cantidad,
            unidad: fd.get("unidad") || "kg",
          });

          const { insumos } = store.getState();
          store.setState({ insumos: [...insumos, nuevo] });

          render();
          showToast("Insumo creado correctamente", "success");
        } catch (e) {
          showToast(e.message || "Error al crear el insumo", "danger");
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
