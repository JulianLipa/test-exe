import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function usePrint() {
  const [content, setContent]       = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [printing, setPrinting]     = useState(false);

  useEffect(() => {
    if (!printing) return;
    const timer = setTimeout(() => {
      window.print();
      setContent(null);
      setPrinting(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [printing]);

  const triggerPrint = useCallback((node) => {
    setContent(node);
    setPreviewing(true);
  }, []);

  const confirmPrint = useCallback(() => {
    setPreviewing(false);
    setPrinting(true);
  }, []);

  const cancelPrint = useCallback(() => {
    setContent(null);
    setPreviewing(false);
  }, []);

  // El print-wrapper siempre tiene --active cuando hay contenido:
  // en pantalla sigue oculto (position:fixed, visibility:hidden),
  // pero en @media print el navegador lo muestra correctamente.
  const portal = content
    ? createPortal(
        <>
          <div className="print-wrapper print-wrapper--active">
            {content}
          </div>

          {previewing && (
            <div style={overlayStyle}>
              <div style={panelStyle}>
                <div style={previewScrollStyle}>
                  <div style={previewContentStyle}>
                    {content}
                  </div>
                </div>
                <div style={actionsStyle}>
                  <button style={btnPrintStyle} onClick={confirmPrint}>Imprimir</button>
                  <button style={btnCancelStyle} onClick={cancelPrint}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )
    : null;

  return { triggerPrint, portal };
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const panelStyle = {
  background: "white",
  color: "#111",
  borderRadius: 8,
  width: "min(820px, 95vw)",
  maxHeight: "92vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
};

const previewScrollStyle = {
  overflowY: "auto",
  flex: 1,
  padding: "24px 32px",
};

const previewContentStyle = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 12,
  color: "#111",
};

const actionsStyle = {
  display: "flex",
  gap: 10,
  padding: "14px 24px",
  borderTop: "1px solid #ddd",
  background: "white",
};

const btnPrintStyle = {
  background: "#0e1925",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "8px 24px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const btnCancelStyle = {
  background: "white",
  color: "#0e1925",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "8px 24px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};
