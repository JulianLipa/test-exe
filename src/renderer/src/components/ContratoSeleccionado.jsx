import StatusBadge from "./StatusBadge.jsx";

export default function ContratoSeleccionado({ alquiler, onCambiar }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button type="button" onClick={onCambiar} style={{ fontSize: "0.82em", padding: "3px 12px" }}>
        ← Cambiar
      </button>
      <span style={{ fontSize: "0.88em", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ opacity: 0.5 }}>Contrato</span>
        <strong>N° {alquiler.id}</strong>
        <StatusBadge fecha_fin={alquiler.fecha_fin} />
        <span style={{ opacity: 0.55 }}>
          {alquiler.locador?.apellido} / {alquiler.locatario?.apellido}
        </span>
      </span>
    </div>
  );
}
