/* Componente: Selector de fincas */
import store from "../store.js";
import { showToast } from "../app.js";

export const FincaSelector = (container) => {
  const { fincas, fincaSeleccionada, user, lotes } = store.getState();

  const fincasConConteo = fincas.map((f) => ({
    ...f,
    lotes_count: lotes.filter((l) => l.finca_id === f.id).length,
  }));

  const html = `
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Seleccionar Finca</h5>
        <div class="row g-3">
          ${fincasConConteo
            .map(
              (finca) => {
                const isSelected = finca.id === fincaSeleccionada;
                return `
                <div class="col-md-4">
                  <div class="finca-card ${isSelected ? "finca-selected" : ""}" data-finca-id="${finca.id}">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">${finca.nombre}</h6>
                        <small class="text-muted">${finca.municipio}, ${finca.departamento}</small>
                      </div>
                      <span class="badge bg-${fincaEstadoColor(finca.estado)}">${finca.estado}</span>
                    </div>
                    <div class="mt-2">
                      <small class="text-muted">Lotes: ${finca.lotes_count || 0}</small>
                    </div>
                  </div>
                </div>
              `;
              }
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  /* Event delegation para seleccionar finca */
  container.querySelectorAll(".finca-card").forEach((card) => {
    card.addEventListener("click", () => {
      const fincaId = parseInt(card.getAttribute("data-finca-id"), 10);
      store.setState({ fincaSeleccionada: fincaId });
      showToast(`Finca seleccionada: ${fincasConConteo.find(f => f.id === fincaId)?.nombre}`, "success");
      render();
    });
  });

  const render = () => {
    const { fincas, fincaSeleccionada } = store.getState();
    container.querySelectorAll(".finca-card").forEach((card) => {
      const id = parseInt(card.getAttribute("data-finca-id"), 10);
      if (id === fincaSeleccionada) {
        card.classList.add("finca-selected");
      } else {
        card.classList.remove("finca-selected");
      }
    });
  };

  render();

  return { destroy: () => {} };
};

const fincaEstadoColor = (estado) => {
  switch (estado) {
    case "ACTIVO": return "success";
    case "EN_DESCANSO": return "warning";
    case "FINALIZADO": return "secondary";
    default: return "primary";
  }
};
