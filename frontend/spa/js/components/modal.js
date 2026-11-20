/* Componente: Modal reutilizable */
export const Modal = ({
  id,
  title,
  onClose,
  onConfirm,
  confirmLabel = "Aceptar",
  onDelete,
  deleteLabel = "Eliminar",
  showDelete = false,
  bodyHtml = "",
}) => {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = id;
  const deleteBtnHtml = showDelete
    ? `<button type="button" class="btn btn-danger" id="${id}-delete">${deleteLabel}</button>`
    : "";
  backdrop.innerHTML = `
    <div class="modal-panel">
      <div class="modal-header">
        <h5 class="modal-title">${title}</h5>
        <button type="button" class="modal-close" id="${id}-close">&times;</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      ${onConfirm || showDelete ? `<div class="modal-footer mt-3" style="display:flex;justify-content:flex-end;gap:var(--space-2);"><button type="button" class="btn btn-outline" id="${id}-cancel">Cancelar</button>${deleteBtnHtml}${onConfirm ? `<button type="button" class="btn btn-primary" id="${id}-confirm">${confirmLabel}</button>` : ""}</div>` : ""}
    </div>
  `;

  document.body.appendChild(backdrop);

  /* Animacion de entrada */
  requestAnimationFrame(() => {
    backdrop.classList.add("visible");
  });

  const close = () => {
    backdrop.classList.remove("visible");
    setTimeout(() => backdrop.remove(), 200);
    if (onClose) onClose();
  };

  backdrop.querySelector("#" + id + "-close").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  if (onConfirm || showDelete) {
    const cancelBtn = backdrop.querySelector("#" + id + "-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", close);
  }

  if (onConfirm) {
    backdrop.querySelector("#" + id + "-confirm").addEventListener("click", () => {
      onConfirm();
      close();
    });
  }

  if (showDelete && onDelete) {
    backdrop.querySelector("#" + id + "-delete").addEventListener("click", () => {
      onDelete();
      close();
    });
  }

  return { close };
};

export const destroyModal = (id) => {
  const el = document.getElementById(id);
  if (el) el.remove();
};
