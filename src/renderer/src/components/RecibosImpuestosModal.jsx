import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fmtDate, fmtNum } from "../utils/formatters.js";
import { labelStyle, valueStyle, sectionLabel } from "../utils/modalStyles.js";

const cardStyle = {
  background: "rgba(237,242,248,0.04)",
  border: "1px solid rgba(237,242,248,0.1)",
  borderRadius: "0.6em",
  padding: "14px 18px",
  display: "grid",
  gridTemplateColumns: "max-content 1fr",
  gap: "8px 24px",
};

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
          width: "60svw",
          maxHeight: "85svh",
          overflowY: "auto",
          background: "rgb(14,25,37)",
          border: "1px solid rgba(237,242,248,0.12)",
          borderRadius: "0.8em",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ ...sectionLabel, gridColumn: "unset", paddingTop: 0 }}>
                Recibos ({recibos.length})
              </span>
              {recibos.length === 0 ? (
                <p style={{ color: "rgba(237,242,248,0.35)", fontSize: "0.82em" }}>Sin recibos registrados.</p>
              ) : (
                recibos.map((r, i) => (
                  <div key={i} style={cardStyle}>
                    <Fragment>
                      <span style={labelStyle}>Fecha</span>
                      <span style={valueStyle}>{fmtDate(r.fecha)}</span>
                      <span style={labelStyle}>Período</span>
                      <span style={valueStyle}>{r.periodo || "-"}</span>
                      <span style={labelStyle}>Importe</span>
                      <span style={valueStyle}>{r.importe != null ? `$${fmtNum(r.importe)}` : "-"}</span>
                    </Fragment>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ ...sectionLabel, gridColumn: "unset", paddingTop: 0 }}>
                Impuestos ({impuestos.length})
              </span>
              {impuestos.length === 0 ? (
                <p style={{ color: "rgba(237,242,248,0.35)", fontSize: "0.82em" }}>Sin impuestos registrados.</p>
              ) : (
                impuestos.map((imp, i) => (
                  <div key={i} style={cardStyle}>
                    <Fragment>
                      <span style={labelStyle}>Fecha</span>
                      <span style={valueStyle}>{fmtDate(imp.fecha)}</span>
                      {imp.expensasPeriodo && (
                        <>
                          <span style={labelStyle}>Exp. período</span>
                          <span style={valueStyle}>{imp.expensasPeriodo}</span>
                        </>
                      )}
                      {imp.aysaVto && (
                        <>
                          <span style={labelStyle}>AYSA vto.</span>
                          <span style={valueStyle}>{imp.aysaVto}</span>
                        </>
                      )}
                      {imp.metrogasVto && (
                        <>
                          <span style={labelStyle}>Metrogas vto.</span>
                          <span style={valueStyle}>{imp.metrogasVto}</span>
                        </>
                      )}
                      {imp.edesur && (
                        <>
                          <span style={labelStyle}>Edesur</span>
                          <span style={valueStyle}>{imp.edesur}</span>
                        </>
                      )}
                      {imp.inmobAblCuota && (
                        <>
                          <span style={labelStyle}>Inmob/ABL</span>
                          <span style={valueStyle}>{imp.inmobAblCuota}</span>
                        </>
                      )}
                      {imp.telefono && (
                        <>
                          <span style={labelStyle}>Teléfono</span>
                          <span style={valueStyle}>{imp.telefono}</span>
                        </>
                      )}
                      {imp.otros && (
                        <>
                          <span style={labelStyle}>Otros</span>
                          <span style={valueStyle}>{imp.otros}</span>
                        </>
                      )}
                    </Fragment>
                  </div>
                ))
              )}
            </div>
          )
        }
      </div>
    </div>,
    document.body
  );
}
