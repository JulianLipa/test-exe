import style from "../NuevoAlquiler.module.css";

const ConfirmModal = ({ open, children }) => {
  if (!open) return null;

  return (
    <div className={style.modalDivContainer}>
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center ${style.modalDiv}`}
      >
        <div className="bg-white p-5 rounded-xl">{children}</div>
      </div>
    </div>
  );
};

export default ConfirmModal;
