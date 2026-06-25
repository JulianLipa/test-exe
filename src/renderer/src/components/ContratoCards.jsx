import StatusBadge from "./StatusBadge.jsx";

export default function ContratoCards({ alquileres, selectedId, onSelect }) {
  const sorted = [...alquileres].sort((a, b) => {
    const da = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
    const db = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
    return db - da;
  });

  return (
    <div className="flex gap-3 flex-wrap">
      {sorted.map((a) => (
        <button
          type="button"
          key={a.id}
          onClick={() => onSelect(a)}
          className={`card-contrato${selectedId != null && String(selectedId) === String(a.id) ? " card-contrato--selected" : ""}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="card-contrato__num">N° {a.id}</span>
            <StatusBadge fecha_fin={a.fecha_fin} />
          </div>
          <span className="card-contrato__info">
            <span className="card-contrato__label">Locador: </span>
            {a.locador?.apellido || "-"}, {a.locador?.nombre || "-"}
          </span>
          <span className="card-contrato__info">
            <span className="card-contrato__label">Locatario: </span>
            {a.locatario?.apellido || "-"}, {a.locatario?.nombre || "-"}
          </span>
          {a.inmueble?.direccion && (
            <span className="card-contrato__addr">{a.inmueble.direccion}</span>
          )}
        </button>
      ))}
    </div>
  );
}
