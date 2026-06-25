import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fmtDate, fmtNum } from "../utils/formatters.js";
import { thStyle, tdStyle, trStyle } from "../utils/tableStyles.js";
import ScrollTopTable from "./ScrollTopTable/ScrollTopTable.jsx";

export default function RecibosImpuestosModal({ alquiler, mode, onClose }) {
  const [recibos,   setRecibos]   = useState([]);
  const [impuestos, setImpuestos] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!alquiler) return;
    Promise.all([
      window.store.getRecibos(),
      window.store.getImpuestos(),
    ]).then(([recs, imps]) => {
      const byFechaDesc = (a, b) => new Date(b.fecha ?? b.createdAt) - new Date(a.fecha ?? a.createdAt);
      setRecibos((Array.isArray(recs) ? recs : []).filter((r) => r.alquilerId === alquiler.id).sort(byFechaDesc));
      setImpuestos((Array.isArray(imps) ? imps : []).filter((i) => i.alquilerId === alquiler.id).sort(byFechaDesc));
      setLoading(false);
    });
  }, [alquiler]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!alquiler) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "80svw",
          maxHeight: "85svh",
          overflow: "hidden",
          background: "rgb(14,25,37)",
          border: "1px solid rgba(237,242,248,0.12)",
          borderRadius: "0.8em",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: "1.1em", color: "rgb(237,242,248)" }}>
            {mode === "recibos" ? "Recibos" : "Impuestos"} — Contrato #{alquiler.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(237,242,248,0.2)",
              color: "rgba(237,242,248,0.6)",
              borderRadius: "0.4em",
              padding: "2px 10px",
              fontSize: "1em",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ color: "rgba(237,242,248,0.45)", fontSize: "0.88em" }}>Cargando...</p>
        ) : mode === "recibos" ? (
          recibos.length === 0 ? (
            <p style={{ color: "rgba(237,242,248,0.35)", fontSize: "0.82em" }}>Sin recibos registrados.</p>
          ) : (
            <ScrollTopTable vertical>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    {["Fecha", "Período", "Importe"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recibos.map((r, i) => (
                    <tr
                      key={i}
                      style={trStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={tdStyle}>{fmtDate(r.fecha)}</td>
                      <td style={tdStyle}>{r.periodo || "-"}</td>
                      <td style={tdStyle}>{r.importe != null ? `$${fmtNum(r.importe)}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollTopTable>
          )
        ) : (
          impuestos.length === 0 ? (
            <p style={{ color: "rgba(237,242,248,0.35)", fontSize: "0.82em" }}>Sin impuestos registrados.</p>
          ) : (
            <ScrollTopTable vertical>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    {["Fecha", "Exp. Período", "AYSA Vto.", "Metrogas Vto.", "Edesur", "Inmob/ABL", "Teléfono", "Otros"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {impuestos.map((imp, i) => (
                    <tr
                      key={i}
                      style={trStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={tdStyle}>{fmtDate(imp.fecha)}</td>
                      <td style={tdStyle}>{imp.expensasPeriodo || "-"}</td>
                      <td style={tdStyle}>{imp.aysaVto || "-"}</td>
                      <td style={tdStyle}>{imp.metrogasVto || "-"}</td>
                      <td style={tdStyle}>{imp.edesur || "-"}</td>
                      <td style={tdStyle}>{imp.inmobAblCuota || "-"}</td>
                      <td style={tdStyle}>{imp.telefono || "-"}</td>
                      <td style={tdStyle}>{imp.otros || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollTopTable>
          )
        )}
      </div>
    </div>,
    document.body
  );
}
