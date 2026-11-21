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

  let closing = false;
  const close = () => {
    if (closing) return;
    closing = true;
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
    const confirmButton = backdrop.querySelector("#" + id + "-confirm");
    let confirming = false;
    confirmButton.addEventListener("click", async () => {
      if (confirming) return;
      const form = backdrop.querySelector(".modal-body form");
      if (form && !form.reportValidity()) return;
      if (form) {
        const blankRequiredField = Array.from(form.querySelectorAll("[required]")).find(
          (field) => !field.value.trim()
        );
        if (blankRequiredField) {
          blankRequiredField.setCustomValidity("Completa este campo.");
          blankRequiredField.reportValidity();
          blankRequiredField.setCustomValidity("");
          return;
        }
      }

      confirming = true;
      confirmButton.disabled = true;
      try {
        const result = await onConfirm();
        if (result !== false) close();
      } finally {
        if (!closing && backdrop.isConnected) {
          confirming = false;
          confirmButton.disabled = false;
        }
      }
    });
  }

  if (showDelete && onDelete) {
    const deleteButton = backdrop.querySelector("#" + id + "-delete");
    let deleting = false;
    deleteButton.addEventListener("click", async () => {
      if (deleting) return;
      deleting = true;
      deleteButton.disabled = true;
      try {
        const result = await onDelete();
        if (result !== false) close();
      } finally {
        if (!closing && backdrop.isConnected) {
          deleting = false;
          deleteButton.disabled = false;
        }
      }
    });
  }

  return { close };
};

export const destroyModal = (id) => {
  const el = document.getElementById(id);
  if (el) el.remove();
};
