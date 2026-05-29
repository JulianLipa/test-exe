import Modal from "../Modal";

import styles from "../Modal/Modal.module.css";

// Reemplazo estilado del alert() nativo: mensaje + un único botón.
const AlertModal = ({
  open,
  title,
  message,
  buttonLabel = "Aceptar",
  onClose,
}) => {
  return (
    <Modal open={open} title={title}>
      {message && <p>{message}</p>}

      <div className={styles.actions}>
        <button type="button" onClick={onClose} className="buttonBlack">
          {buttonLabel}
        </button>
      </div>
    </Modal>
  );
};

export default AlertModal;
