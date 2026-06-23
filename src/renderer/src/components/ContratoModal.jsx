import { Fragment } from "react";
import { createPortal } from "react-dom";
import { fmtDate, fmtNum, calcTotalPeriodos } from "../utils/formatters.js";
import { labelStyle, valueStyle, sectionLabel, divider } from "../utils/modalStyles.js";

export default function ContratoModal({ alquiler, onClose }) {
  if (!alquiler) return null;

  const mainRows = [
    { label: "Locador",       value: `${alquiler.locador?.apellido || "-"}, ${alquiler.locador?.nombre || "-"}` },
    { label: "Dir. Locador",  value: alquiler.locador?.direccion || "-" },
    { label: "Tel. Locador",  value: alquiler.locador?.telefono  || "-" },
    { label: "Locatario",     value: `${alquiler.locatario?.apellido || "-"}, ${alquiler.locatario?.nombre || "-"}` },
    { label: "Inmueble",      value: alquiler.inmueble?.direccion || "-" },
    { label: "Tel. Inmueble", value: alquiler.inmueble?.telefono  || "-" },
    { label: "Inicio",        value: fmtDate(alquiler.fecha_inicio) },
    { label: "Fin",           value: fmtDate(alquiler.fecha_fin) },
    { label: "Actualiz.",     value: alquiler.actualizacion_meses ? `${alquiler.actualizacion_meses} meses` : "-" },
    { label: "Índice",        value: alquiler.indice || "-" },
    { label: "Honorario",     value: alquiler.honorario ? `${alquiler.honorario}%` : "-" },
    { label: "Depósito",      value: alquiler.deposito_garantia ? `$${fmtNum(alquiler.deposito_garantia)}` : "-" },
  ];

  const impRows = [
    { label: "AGIP",     value: alquiler.impuestos?.AGIP     != null ? String(alquiler.impuestos.AGIP)     : "-" },
    { label: "AYSA",     value: alquiler.impuestos?.AYSA     != null ? String(alquiler.impuestos.AYSA)     : "-" },
    { label: "Metrogas", value: alquiler.impuestos?.METROGAS != null ? String(alquiler.impuestos.METROGAS) : "-" },
    { label: "Edesur",   value: alquiler.impuestos?.EDESUR   != null ? String(alquiler.impuestos.EDESUR)   : "-" },
  ];

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
          gap: 0,
        }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: "1.1em", color: "rgb(237,242,248)" }}>
            Contrato #{alquiler.id}
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

        {/* Grid 2 columnas */}
        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "9px 28px" }}>

          {mainRows.map(({ label, value }) => (
            <Fragment key={label}>
              <span style={labelStyle}>{label}</span>
              <span style={valueStyle}>{value}</span>
            </Fragment>
          ))}

          <div style={divider} />
          <span style={sectionLabel}>Impuestos</span>

          {impRows.map(({ label, value }) => (
            <Fragment key={label}>
              <span style={labelStyle}>{label}</span>
              <span style={valueStyle}>{value}</span>
            </Fragment>
          ))}

          {(() => {
            const total = calcTotalPeriodos(alquiler.fecha_inicio, alquiler.fecha_fin, alquiler.actualizacion_meses);
            const allNums = total
              ? Array.from({ length: total }, (_, i) => i + 1)
              : (alquiler.montos?.length ? alquiler.montos.map((m) => m.numero) : null);
            if (!allNums) return null;
            return (
              <>
                <div style={divider} />
                <span style={sectionLabel}>Montos</span>
                {allNums.map((num) => {
                  const m = alquiler.montos?.find((x) => x.numero === num);
                  return (
                    <Fragment key={num}>
                      <span style={labelStyle}>Monto {num}</span>
                      <span style={valueStyle}>{m?.monto != null ? `$${fmtNum(m.monto)}` : "-"}</span>
                    </Fragment>
                  );
                })}
              </>
            );
          })()}
        </div>
      </div>
    </div>,
    document.body
  );
}
