/* Componente: Tabla de datos */
export const DataTable = ({ columns, data, emptyMessage = "No hay datos disponibles", selectedKey = null }) => {
  const thead = columns.map((col) => `<th>${col.label}</th>`).join("");
  const tbody = data.length
    ? data
        .map(
          (row) => {
            const key = row.codigo_qr ?? row.id ?? row.nombre;
            const isSelected = selectedKey === key;
            return `
        <tr class="${isSelected ? "table-primary" : ""}" style="cursor:pointer;" data-row-key="${key}">
          ${columns
            .map(
              (col) =>
                `<td>${col.render ? col.render(row) : row[col.key] ?? ""}</td>`
            )
            .join("")}
        </tr>
      `;
          }
        )
        .join("")
    : `<tr><td colspan="${columns.length}" class="text-muted py-4">${emptyMessage}</td></tr>`;

  return `
    <table class="table data-table">
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table>
  `;
};
