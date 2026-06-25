import ConfirmModal from "./ConfirmModal";

export default function VolverModal({ open, onConfirm, onCancel }) {
  return (
    <ConfirmModal open={open} onConfirm={onConfirm} onCancel={onCancel}>
      <div className="p-4">
        <p className="mb-4">¿Seguro que querés volver al menú?</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="buttonBlack">Sí</button>
          <button onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </ConfirmModal>
  );
}
