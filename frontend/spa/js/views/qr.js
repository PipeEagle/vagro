/* Vista: QR Scan (publico) */
import { apiClient } from "../services/api.js";
import { showToast } from "../app.js";

export const QRView = (container) => {
  let isSearching = false;

  const render = (result = null, error = null) => {
    container.innerHTML = `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="card shadow-sm">
              <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                  <span class="badge bg-info">QR</span>
                  <h2 class="h3 mt-3">Identificar lote</h2>
                  <p class="text-muted">Ingresa el codigo QR del lote</p>
                </div>

                <form id="qrForm" novalidate>
                  <div class="mb-4">
                    <label class="form-label">Codigo del lote</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        name="codigo"
                        required
                        autocomplete="off"
                        placeholder="LOTE-CAF-001"
                        ${isSearching ? "disabled" : ""}
                      />
                      <button
                        type="submit"
                        class="btn btn-primary"
                        id="btnBuscar"
                        ${isSearching ? "disabled" : ""}
                      >
                        ${isSearching
                          ? '<span class="spinner-border spinner-border-sm"></span>'
                          : "Buscar"}
                      </button>
                    </div>
                  </div>
                </form>

                ${
                  error
                    ? `<div class="alert alert-danger" role="alert">${error}</div>`
                    : ""
                }

                ${
                  result
                    ? `
                    <div class="card border-success mt-4">
                      <div class="card-body">
                        <h5 class="card-title">${result.nombre || "Lote"}</h5>
                        <p class="mb-1"><strong>Codigo:</strong> ${result.codigo_qr || "-"}</p>
                        <p class="mb-1"><strong>Cultivo:</strong> ${result.cultivo?.nombre || "-"}</p>
                        <p class="mb-1"><strong>Area:</strong> ${(result.hectareas || 0).toFixed(2)} ha</p>
                        <span class="badge bg-success">Estado: Activo</span>
                      </div>
                    </div>
                    `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector("#qrForm");
    form.addEventListener("submit", handleSearch);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const codigo = formData.get("codigo").trim();

    if (!codigo) {
      showToast("Ingresa un codigo QR valido", "error");
      return;
    }

    isSearching = true;
    render(null, null);

    try {
      const res = await apiClient.get(`/api/lotes/qr/${codigo}`);
      const data = res.data || res;
      render(data, null);
      showToast("Lote encontrado", "success");
    } catch (err) {
      const msg =
        err.status === 404
          ? "No se encontro un lote activo con ese codigo QR"
          : err.message || "Error al buscar";
      render(null, msg);
      showToast(msg, "error");
    } finally {
      isSearching = false;
      render(null, null);
    }
  };

  render();

  return {
    destroy: () => {
      const form = container.querySelector("#qrForm");
      if (form) form.removeEventListener("submit", handleSearch);
    },
  };
};
