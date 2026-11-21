/* Vista: InsumoDetalle - Detalle completo con botones Editar/Eliminar */
import store from "../store.js";
import { apiClient } from "../services/api.js";
import { Modal } from "../components/modal.js";
import { showToast, goTo, validateRequired } from "../app.js";

export const InsumoDetalleView = (container, { id }) => {
  const { user } = store.getState();
  const puedeEditar =
    user?.rol === "SUPERADMIN" || user?.rol === "ADMIN" || user?.rol === "MAYORDOMO";

  let insumo = null;

  const render = () => {
    const { insumos } = store.getState();
    insumo = insumos.find((i) => i.id === parseInt(id));
    if (!insumo) {
      container.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-1 fw-bold">404</h1>
            <p class="lead text-muted">Insumo no encontrado</p>
            <a href="/insumos" class="btn btn-primary" data-router>Volver a insumos</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-secondary" id="btnAtras" data-router>Atras</button>
          <h2>Detalle de insumo</h2>
          <div class="d-flex gap-2">
            ${puedeEditar ? `<button class="btn btn-outline" id="btnEditar">Editar</button>` : ""}
            ${puedeEditar ? `<button class="btn btn-danger" id="btnEliminar">Eliminar</button>` : ""}
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Informacion del insumo</h5>
                <p><strong>Nombre:</strong> ${insumo.nombre}</p>
                <p><strong>Tipo:</strong> ${insumo.tipo}</p>
                <p><strong>Ingrediente activo:</strong> ${insumo.ingrediente || "-"}</p>
                <p><strong>Carencia:</strong> ${insumo.carencia || "-"}</p>
                <p><strong>Cantidad:</strong> ${insumo.cantidad == null ? "Sin registrar" : `${Number(insumo.cantidad).toLocaleString("es-CO")} ${insumo.unidad}`}</p>
                <p><strong>Unidad:</strong> ${insumo.unidad}</p>
                <p><strong>Finca:</strong> ${insumo.finca_id}</p>
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
        goTo("/insumos");
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
    Modal({
      id: "modalEditarInsumo",
      title: "Editar insumo",
      bodyHtml: `
        <form id="formEditarInsumo">
          <div class="mb-3">
            <label class="form-label">Nombre comercial</label>
            <input type="text" class="form-control" name="nombre" value="${insumo.nombre}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Tipo</label>
            <select class="form-select" name="tipo" required>
              <option value="fertilizante" ${insumo.tipo === "fertilizante" ? "selected" : ""}>Fertilizante</option>
              <option value="fungicida" ${insumo.tipo === "fungicida" ? "selected" : ""}>Fungicida</option>
              <option value="insecticida" ${insumo.tipo === "insecticida" ? "selected" : ""}>Insecticida</option>
              <option value="enmienda" ${insumo.tipo === "enmienda" ? "selected" : ""}>Enmienda</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Ingrediente activo</label>
            <input type="text" class="form-control" name="ingrediente" value="${insumo.ingrediente || ""}">
          </div>
          <div class="mb-3">
            <label class="form-label">Periodo de carencia (dias)</label>
            <input type="number" class="form-control" name="carencia" value="${!insumo.carencia || insumo.carencia === "-" ? "" : insumo.carencia}" min="0">
          </div>
          <div class="mb-3">
            <label class="form-label">Cantidad disponible</label>
            <input type="number" class="form-control" name="cantidad" value="${insumo.cantidad ?? ""}" min="0" step="0.01" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Unidad</label>
            <select class="form-select" name="unidad" required>
              <option value="kg" ${insumo.unidad === "kg" ? "selected" : ""}>kg</option>
              <option value="L" ${insumo.unidad === "L" ? "selected" : ""}>L</option>
            </select>
          </div>
        </form>
      `,
      onConfirm: async () => {
        const form = document.getElementById("formEditarInsumo");
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
        try {
          const actualizado = await apiClient.put(`/api/insumos/${insumo.id}`, {
            finca_id: insumo.finca_id,
            nombre: fd.get("nombre").trim(),
            tipo: fd.get("tipo"),
            ingrediente: fd.get("ingrediente") || null,
            carencia: carencia || null,
            cantidad,
            unidad: fd.get("unidad"),
          });
          const { insumos } = store.getState();
          store.setState({
            insumos: insumos.map((item) => item.id === actualizado.id ? actualizado : item),
          });
          insumo = actualizado;
          render();
          showToast("Insumo actualizado", "success");
        } catch (error) {
          showToast(error.message || "Error al actualizar el insumo", "danger");
          return false;
        }
        return true;
      },
      confirmLabel: "Guardar cambios",
    });
  };

  const eliminarInsumo = async () => {
    try {
      await apiClient.delete(`/api/insumos/${insumo.id}`);
    } catch (error) {
      showToast(error.message || "Error al eliminar el insumo", "danger");
      return false;
    }

    const { insumos = [] } = store.getState();
    store.setState({ insumos: insumos.filter((item) => item.id !== insumo.id) });
    showToast("Insumo eliminado", "success");
    goTo("/insumos");
    return true;
  };

  const abrirModalEliminar = () => {
    Modal({
      id: "modalEliminarInsumo",
      title: "Eliminar insumo",
      bodyHtml: `
        <p>¿Estas seguro de eliminar el insumo <strong>${insumo.nombre}</strong>?</p>
        <p class="text-danger">Esta accion no se puede deshacer.</p>
      `,
      onDelete: eliminarInsumo,
      deleteLabel: "Eliminar",
      showDelete: true,
    });
  };

  render();

  return { destroy: () => {} };
};
