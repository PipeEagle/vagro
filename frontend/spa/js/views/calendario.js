/* Vista: Calendario Agronomico (protegida) - Selector de mes y visualizacion de labores */
import store from "../store.js";
import { showToast, goTo } from "../app.js";
import { getLocalDateString } from "../utils/date.js";

/* Convierte una labor en un evento del calendario para renderizado */
const laborToEvento = (l) => ({
  id: l.id,
  fecha: l.fecha,
  titulo: `${l.tipo} - ${l.lote_codigo_qr}`,
  tipo: l.tipo,
  estado: l.estado === "Completada" ? "Realizada" : l.estado,
  finca_id: l.finca_id,
});

export const CalendarioView = (container) => {
  let anioSeleccionado = new Date().getFullYear();
  let mesSeleccionado = new Date().getMonth(); /* 0-11 */

  const render = () => {
    const hoy = getLocalDateString();
    const { fincaSeleccionada, user, labores } = store.getState();

    /* Primer y ultimo dia del mes seleccionado */
    const primerDiaMes = new Date(anioSeleccionado, mesSeleccionado, 1);
    const ultimoDiaMes = new Date(anioSeleccionado, mesSeleccionado + 1, 0);
    const totalDias = ultimoDiaMes.getDate();

    /* Dia de la semana del primer dia (0=Dom, 1=Lun...). Ajustamos para que Lun sea 0 */
    const diaSemanaPrimerDia = (primerDiaMes.getDay() + 6) % 7;

    /* Filtrar labores por finca y por mes seleccionado */
    let laboresFiltradas = labores;
    if (user?.rol === "MAYORDOMO") {
      laboresFiltradas = labores.filter((l) => l.finca_id === user.finca_id);
    } else if (fincaSeleccionada) {
      laboresFiltradas = labores.filter((l) => l.finca_id === fincaSeleccionada);
    }

    const laboresMes = laboresFiltradas.filter((l) => {
      const [y, m] = l.fecha.split("-").map(Number);
      return y === anioSeleccionado && (m - 1) === mesSeleccionado;
    });

    const eventos = laboresMes.map(laborToEvento);

    const eventosPorFecha = {};
    eventos.forEach((e) => {
      if (!eventosPorFecha[e.fecha]) eventosPorFecha[e.fecha] = [];
      eventosPorFecha[e.fecha].push(e);
    });

    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Calendario Agronomico</h1>
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline" id="btnMesAnterior">&lt;</button>
            <span class="fw-semibold">${nombresMeses[mesSeleccionado]} ${anioSeleccionado}</span>
            <button class="btn btn-outline" id="btnMesSiguiente">&gt;</button>
          </div>
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
                    ${generarDias(primerDiaMes, totalDias, diaSemanaPrimerDia, hoy, eventosPorFecha)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Labores del mes</h5>
                <div class="list-group list-group-flush">
                  ${laboresMes
                    .slice()
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .map(
                      (l) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center p-2" data-labor-id="${l.id}">
                      <div>
                        <div class="fw-semibold small">${l.tipo} - ${l.lote_codigo_qr}</div>
                        <div class="text-muted smaller">${l.fecha}</div>
                      </div>
                      <span class="badge bg-${estadoColor(l.estado === "Completada" ? "Realizada" : l.estado)}">${l.estado}</span>
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

    /* Navegacion de meses */
    document.getElementById("btnMesAnterior").addEventListener("click", () => {
      mesSeleccionado--;
      if (mesSeleccionado < 0) {
        mesSeleccionado = 11;
        anioSeleccionado--;
      }
      render();
    });

    document.getElementById("btnMesSiguiente").addEventListener("click", () => {
      mesSeleccionado++;
      if (mesSeleccionado > 11) {
        mesSeleccionado = 0;
        anioSeleccionado++;
      }
      render();
    });

    /* Click en labores de la lista lateral -> abre detalle de labor */
    container.querySelectorAll(".list-group-item[data-labor-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(el.getAttribute("data-labor-id"), 10);
        store.setState({ returnTo: "/calendario" });
        goTo(`/labores/${id}`);
      });
    });

    /* Click en eventos dentro de las celdas del calendario */
    container.querySelectorAll(".cal-evento[data-labor-id]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(el.getAttribute("data-labor-id"), 10);
        store.setState({ returnTo: "/calendario" });
        goTo(`/labores/${id}`);
      });
    });
  };

  const generarDias = (primerDiaMes, totalDias, diaSemanaPrimerDia, hoy, eventosPorFecha) => {
    const dias = [];

    /* Celdas vacias antes del primer dia del mes */
    for (let i = 0; i < diaSemanaPrimerDia; i++) {
      dias.push(`<div class="cal-cell cal-vacio"></div>`);
    }

    /* Dias del mes */
    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = new Date(anioSeleccionado, mesSeleccionado, dia);
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
      const evsDelDia = eventosPorFecha[fechaStr] || [];
      const esHoy = fechaStr === hoy;

      let eventosHtml = "";
      if (evsDelDia.length > 0) {
        eventosHtml = evsDelDia
          .map(
            (e) => `
            <div class="cal-evento small ${estadoClase(e.estado)}" data-labor-id="${e.id}" data-finca-id="${e.finca_id}" title="${e.titulo}">
              ${e.titulo.length > 12 ? e.titulo.substring(0, 12) + "..." : e.titulo}
            </div>
          `
          )
          .join("");
      }

      dias.push(`
        <div class="cal-cell ${esHoy ? "cal-hoy" : ""}" data-fecha="${fechaStr}">
          <div class="cal-fecha">${dia}</div>
          ${eventosHtml}
        </div>
      `);
    }

    return dias.join("");
  };

  const estadoClase = (estado) => {
    switch (estado) {
      case "Pendiente": return "bg-info text-dark";
      case "Por confirmar": return "bg-warning text-dark";
      case "Vencida": return "bg-danger";
      case "Realizada": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const estadoColor = (estado) => {
    switch (estado) {
      case "Pendiente": return "info";
      case "Por confirmar": return "warning";
      case "Vencida": return "danger";
      case "Realizada": return "success";
      default: return "secondary";
    }
  };

  render();

  return { destroy: () => {} };
};
