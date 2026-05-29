import styles from "./Modal.module.css";

// Base presentacional de todos los popups de la app (overlay + card).
// ConfirmModal y AlertModal se construyen encima para garantizar el
// mismo estilo en cualquier modal o alerta.
const Modal = ({ open, title, children }) => {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {title && <p className={styles.title}>{title}</p>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
