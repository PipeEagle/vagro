/* Componente: Tarjeta KPI */
export const KpiCard = ({ label, value }) => {
  return `
    <div class="kpi-card">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="kpi-label">${label}</div>
          <div class="kpi-value">${value}</div>
        </div>
      </div>
    </div>
  `;
};
