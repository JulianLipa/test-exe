import { useEffect } from "react";

const ConfirmModal = ({ open, onConfirm, onCancel, children }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Enter" && onConfirm) { e.preventDefault(); onConfirm(); }
      if (e.key === "Escape" && onCancel) onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1em",
      }}
      className="blue gap-2 flex"
    >
      <div style={{ background: "#fff", padding: 20, borderRadius: "1em" }}>
        {children}
      </div>
    </div>
  );
};

export default ConfirmModal;
