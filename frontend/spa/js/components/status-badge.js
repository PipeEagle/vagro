/* Componente: Badge de estado */
export const StatusBadge = ({ estado, tipo = "estado" }) => {
  let clase = "status-activo";
  let texto = estado || "Sin estado";

  if (tipo === "estado") {
    switch (estado) {
      case "ACTIVO":
        clase = "status-activo";
        texto = "Activo";
        break;
      case "EN_DESCANSO":
        clase = "status-en-descanso";
        texto = "En descanso";
        break;
      case "FINALIZADO":
        clase = "status-finalizado";
        texto = "Finalizado";
        break;
      default:
        clase = "status-activo";
    }
  } else if (tipo === "labor") {
    switch (estado) {
      case "fertilizacion":
        clase = "status-fertilizacion";
        texto = "Fertilizacion";
        break;
      case "fumigacion":
        clase = "status-fumigacion";
        texto = "Fumigacion";
        break;
      case "poda":
        clase = "status-poda";
        texto = "Poda";
        break;
      case "cosecha":
        clase = "status-cosecha";
        texto = "Cosecha";
        break;
      default:
        clase = "status-activo";
        texto = estado;
    }
  }

  return `<span class="status-badge ${clase}">${texto}</span>`;
};
