/* Vista: Dashboard (protegida) */
import store from "../store.js";
import { KpiCard } from "../components/kpi-card.js";
import { StatusBadge } from "../components/status-badge.js";
import { FincaSelector } from "../components/finca-selector.js";
import { showToast, goTo } from "../app.js";

export const DashboardView = (container) => {
  const { user, fincas, fincaSeleccionada, lotes, labores, cosechas } = store.getState();
  const esMayordomo = user?.rol === "MAYORDOMO";

  const fincasList = fincas || [];
  const lotesList = lotes || [];
  const laboresList = labores || [];
  const cosechasList = cosechas || [];

  let fincaActiva = fincaSeleccionada ? fincasList.find((f) => f.id === fincaSeleccionada) : null;
  if (esMayordomo && user?.finca_id) {
    fincaActiva = fincasList.find((f) => f.id === user.finca_id);
    store.setState({ fincaSeleccionada: user.finca_id });
  }

  const datosFiltradosPorFinca = (arr) => {
    if (esMayordomo && user?.finca_id) return arr.filter((d) => d.finca_id === user.finca_id);
    if (fincaSeleccionada) return arr.filter((d) => d.finca_id === fincaSeleccionada);
    return arr;
  };

  const lotesFinca = datosFiltradosPorFinca(lotesList);
  const laboresFinca = datosFiltradosPorFinca(laboresList);
  const cosechasFinca = datosFiltradosPorFinca(cosechasList);
  const puedeVerTodasLasFincas = !esMayordomo && fincasList.length > 0;
  const hayFincaParaMostrar = Boolean(fincaActiva) || puedeVerTodasLasFincas;

  const totalHectareas = lotesFinca.reduce((sum, l) => sum + (l.hectareas || 0), 0);
  const laboresPendientes = laboresFinca.filter((l) => l.estado === "Pendiente" || l.estado === "Por confirmar").length;
  const laboresCompletadas = laboresFinca.filter((l) => l.estado === "Completada").length;
  const lotesProduccion = lotesFinca.filter((l) => l.estado_fenologico === "Produccion").length;
  const produccionMes = cosechasFinca
    .filter((c) => c.estado === "Completada")
    .reduce((sum, c) => sum + (c.cantidad || 0), 0);
  const eventosProximos = laboresFinca.filter((l) => l.estado === "Pendiente" || l.estado === "Por confirmar").length;

  const renderLoading = () => {
    container.innerHTML = `
      <div class="container py-4">
        <div class="loading-state">
          <div class="spinner"></div>
          <p class="text-muted">Cargando panel...</p>
        </div>
      </div>
    `;
  };

  const renderError = (msg) => {
    container.innerHTML = `
      <div class="container py-4">
        <div class="error-state">
          <h3 class="error-title">Error</h3>
          <p>${msg}</p>
          <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const fincaNombre = fincaActiva ? fincaActiva.nombre : "todas las fincas";
    const resumenHTML = hayFincaParaMostrar ? `
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          ${KpiCard({ label: "Hectareas activas", value: totalHectareas.toFixed(1) + " ha", icon: "hs", color: "success" })}
        </div>
        <div class="col-md-3">
          ${KpiCard({ label: "Labores pendientes", value: laboresPendientes, icon: "task", color: "warning" })}
        </div>
        <div class="col-md-3">
          ${KpiCard({ label: "Lotes en produccion", value: lotesProduccion, icon: "plot", color: "info" })}
        </div>
        <div class="col-md-3">
          ${KpiCard({ label: "Produccion mes", value: produccionMes.toLocaleString() + " @", icon: "harvest", color: "danger" })}
        </div>
        <div class="col-md-3">
          ${KpiCard({ label: "Total lotes", value: lotesFinca.length, icon: "farm", color: "primary" })}
        </div>
        <div class="col-md-3">
          ${KpiCard({ label: "Eventos proximos", value: eventosProximos, icon: "calendar", color: "info" })}
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Lotes de ${fincaNombre}</h5>
              ${lotesFinca.length > 0 ? `
                <div class="list-group list-group-flush">
                  ${lotesFinca.map((l) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center p-2" data-lote-id="${l.id}" style="cursor:pointer;">
                      <div>
                        <div class="fw-semibold">${l.codigo_qr}</div>
                        <div class="text-muted small">${l.nombre}</div>
                      </div>
                      <span class="badge bg-${l.estado === "ACTIVO" ? "success" : "warning"}">${l.estado}</span>
                    </div>
                  `).join("")}
                </div>
              ` : `<p class="text-muted text-center py-3">No hay lotes registrados para esta finca.</p>`}
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Labores recientes</h5>
              ${laboresFinca.length > 0 ? `
                <div class="list-group list-group-flush">
                  ${laboresFinca
                    .slice()
                    .sort((a, b) => b.fecha.localeCompare(a.fecha))
                    .slice(0, 6)
                    .map((l) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center p-2" data-labor-id="${l.id}" style="cursor:pointer;">
                      <div>
                        <div class="fw-semibold">${l.tipo}</div>
                        <div class="text-muted small">${lotesList.find((lote) => lote.id === l.lote_id)?.codigo_qr || "Lote no disponible"} - ${l.fecha}</div>
                      </div>
                      <span class="badge bg-${l.estado === "Completada" ? "success" : l.estado === "Pendiente" ? "info" : "warning"}">${l.estado}</span>
                    </div>
                  `).join("")}
                </div>
              ` : `<p class="text-muted text-center py-3">No hay labores registradas para esta finca.</p>`}
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mt-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Cosechas del mes</h5>
              ${cosechasFinca.length > 0 ? `
                <div class="table-responsive">
                  <table class="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Lote</th>
                        <th>Fecha</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Calidad</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${cosechasFinca.map((c) => `
                        <tr data-cosecha-id="${c.id}" style="cursor:pointer;">
                          <td>${c.lote_codigo_qr}</td>
                          <td>${c.fecha}</td>
                          <td>${c.cantidad}</td>
                          <td>${c.unidad}</td>
                          <td>${c.calidad}</td>
                          <td>${StatusBadge({ estado: c.estado, tipo: "estado" })}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              ` : `<p class="text-muted text-center py-3">No hay cosechas registradas para esta finca.</p>`}
            </div>
          </div>
        </div>
      </div>
    ` : `
      <div class="text-center py-5">
        <div class="empty-state">
          <div class="empty-state-icon">🏔️</div>
          <h3 class="error-title">${fincasList.length ? "Selecciona una finca" : "No hay fincas disponibles"}</h3>
          <p class="text-muted">${fincasList.length ? "Para comenzar a trabajar, selecciona una finca del selector superior." : "No se encontraron fincas cargadas en el sistema."}</p>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="container py-4">
        <h1 class="mb-4">Panel de administracion</h1>
        ${resumenHTML}
      </div>
    `;

    /* Clic en lotes del resumen -> detalle */
    container.querySelectorAll("[data-lote-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("a[data-router]")) return;
        const id = parseInt(el.getAttribute("data-lote-id"), 10);
        goTo(`/lotes/${id}`);
      });
    });

    /* Clic en labores del resumen -> detalle */
    container.querySelectorAll("[data-labor-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("a[data-router]")) return;
        const id = parseInt(el.getAttribute("data-labor-id"), 10);
        goTo(`/labores/${id}`);
      });
    });

    /* Clic en cosechas del resumen -> detalle */
    container.querySelectorAll("[data-cosecha-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("a[data-router]")) return;
        const id = parseInt(el.getAttribute("data-cosecha-id"), 10);
        goTo(`/cosechas/${id}`);
      });
    });

    /* Renderizar selector de fincas solo si no es mayordomo */
    if (!esMayordomo) {
      const fincaContainer = container.querySelector("#finca-selector-container");
      if (fincaContainer) {
        FincaSelector(fincaContainer);
      }
    }
  };

  renderLoading();

  setTimeout(() => {
    renderContent();
  }, 300);

  return {
    destroy: () => {},
  };
};
