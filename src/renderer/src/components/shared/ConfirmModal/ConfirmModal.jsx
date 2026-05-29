import Modal from "../Modal";

import styles from "../Modal/Modal.module.css";

// Confirmación estándar: mensaje (title/children) + acciones cancelar/confirmar.
const ConfirmModal = ({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal open={open} title={title}>
      {children}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          {cancelLabel}
        </button>

        <button type="button" onClick={onConfirm} className="buttonBlack">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
