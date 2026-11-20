/* Vista: Calendario Agronomico (protegida) - Solo visualizacion/consulta */
import store from "../store.js";
import { showToast, goTo } from "../app.js";

export const CalendarioView = (container) => {
  const render = () => {
    const hoy = new Date().toISOString().split("T")[0];
    const { fincaSeleccionada, user, eventos } = store.getState();

    let eventosFiltrados = eventos;
    if (user?.rol === "MAYORDOMO") {
      eventosFiltrados = eventos.filter((e) => e.finca_id === user.finca_id);
    } else if (fincaSeleccionada) {
      eventosFiltrados = eventos.filter((e) => e.finca_id === fincaSeleccionada);
    }

    const eventosPorFecha = {};
    eventosFiltrados.forEach((e) => {
      if (!eventosPorFecha[e.fecha]) eventosPorFecha[e.fecha] = [];
      eventosPorFecha[e.fecha].push(e);
    });

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Calendario Agronomico</h1>
        </div>

        <div class="row">
          <div class="col-lg-9">
            <div class="card shadow-sm">
              <div class="card-body p-3">
                <div class="calendar-grid">
                  <div class="cal-week-header">
                    <div class="cal-day-header">Lun</div>
                    <div class="cal-day-header">Mar</div>
                    <div class="cal-day-header">Mie</div>
                    <div class="cal-day-header">Jue</div>
                    <div class="cal-day-header">Vie</div>
                    <div class="cal-day-header">Sab</div>
                    <div class="cal-day-header">Dom</div>
                  </div>
                  <div class="cal-days">
                    ${generarDias(hoy, eventosPorFecha)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Eventos proximos</h5>
                <div class="list-group list-group-flush">
                  ${eventosFiltrados
                    .slice()
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .slice(0, 5)
                    .map(
                      (e) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center p-2" data-evento-id="${e.id}">
                      <div>
                        <div class="fw-semibold small">${e.titulo}</div>
                        <div class="text-muted smaller">${e.fecha}</div>
                      </div>
                      <span class="badge bg-${estadoColor(e.estado)}">${e.estado}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    /* Click en eventos de la lista lateral -> abre detalle de labor */
    container.querySelectorAll(".list-group-item[data-evento-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(el.getAttribute("data-evento-id"), 10);
        store.setState({ returnTo: "/calendario" });
        goTo(`/labores/${id}`);
      });
    });

    /* Click en celdas del calendario */
    container.querySelectorAll(".cal-cell[data-fecha]").forEach((celda) => {
      celda.addEventListener("click", () => {
        const fecha = celda.getAttribute("data-fecha");
        const evsDelDia = eventosPorFecha[fecha] || [];
        if (evsDelDia.length === 0) {
          return; /* Sin evento, no hacer nada */
        } else if (evsDelDia.length === 1) {
          store.setState({ returnTo: "/calendario" });
          goTo(`/labores/${evsDelDia[0].id}`);
        } else {
          store.setState({ returnTo: "/calendario" });
          goTo(`/labores/${evsDelDia[0].id}`);
        }
      });
    });

    /* Click en eventos individuales dentro de las celdas */
    container.querySelectorAll(".cal-evento[data-evento-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(el.getAttribute("data-evento-id"), 10);
        store.setState({ returnTo: "/calendario" });
        goTo(`/labores/${id}`);
      });
    });
  };

  const generarDias = (hoy, eventosPorFecha) => {
    const dias = [];
    const primerDia = new Date(hoy);
    primerDia.setDate(primerDia.getDate() - ((primerDia.getDay() + 6) % 7));

    for (let i = 0; i < 28; i++) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().split("T")[0];
      const evsDelDia = eventosPorFecha[fechaStr] || [];
      const esHoy = fechaStr === hoy;

      let eventosHtml = "";
      if (evsDelDia.length > 0) {
        eventosHtml = evsDelDia
          .map(
            (e) => `
            <div class="cal-evento small ${estadoClase(e.estado)}" data-evento-id="${e.id}" data-finca-id="${e.finca_id}" title="${e.titulo}">
              ${e.titulo.length > 12 ? e.titulo.substring(0, 12) + "..." : e.titulo}
            </div>
          `
          )
          .join("");
      }

      dias.push(`
        <div class="cal-cell ${esHoy ? "cal-hoy" : ""}" data-fecha="${fechaStr}">
          <div class="cal-fecha">${fecha.getDate()}</div>
          ${eventosHtml}
        </div>
      `);
    }

    return dias.join("");
  };

  const estadoClase = (estado) => {
    switch (estado) {
      case "Programada": return "bg-info text-dark";
      case "Pendiente": return "bg-warning text-dark";
      case "Vencida": return "bg-danger";
      case "Realizada": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const estadoColor = (estado) => {
    switch (estado) {
      case "Programada": return "info";
      case "Pendiente": return "warning";
      case "Vencida": return "danger";
      case "Realizada": return "success";
      default: return "secondary";
    }
  };

  render();

  return { destroy: () => {} };
};
