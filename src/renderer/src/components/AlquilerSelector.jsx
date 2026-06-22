import { useState } from "react";

export default function AlquilerSelector({ onChange }) {
  const [query, setQuery]           = useState("");
  const [resultados, setResultados] = useState([]);
  const [alquiler, setAlquiler]     = useState(null);
  const [id, setId]                 = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    const db = await window.store.loadDB();
    if (!Array.isArray(db)) return;
    const q = query.toLowerCase().trim();
    const res = db.filter((a) => {
      const apellido = (a?.locatario?.apellido || "").toLowerCase();
      return apellido.includes(q) || String(a?.id || "").includes(q);
    });
    setResultados(res);
  };

  const handleSelect = (a) => {
    setAlquiler(a);
    setId(String(a.id));
    setResultados([]);
    setQuery("");
    onChange(a, String(a.id));
  };

  const handleIdChange = (val) => {
    setId(val);
    onChange(alquiler, val);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Búsqueda */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Apellido o N° de contrato"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          className="border p-2 rounded w-full"
          autoFocus
        />
        <button type="button" onClick={handleSearch}>Buscar</button>
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {resultados.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => handleSelect(a)}
              className={`border rounded p-4 text-left transition ${
                alquiler?.id === a.id ? "border-black bg-gray-100" : ""
              }`}
            >
              <div>N° {a.id}</div>
              <div>{a.locatario?.apellido}, {a.locatario?.nombre}</div>
              <div>{a.inmueble?.direccion}</div>
            </button>
          ))}
        </div>
      )}

      {/* N° de contrato editable */}
      <input
        type="number"
        placeholder="N° de contrato"
        value={id}
        onChange={(e) => handleIdChange(e.target.value)}
        className="border p-2 rounded"
      />

      {/* Info del seleccionado */}
      {alquiler && (
        <div className="flex flex-col gap-1 thin" style={{ fontSize: "0.88em", opacity: 0.7 }}>
          <span>{alquiler.locatario?.apellido}, {alquiler.locatario?.nombre}</span>
          <span>{alquiler.inmueble?.direccion}</span>
        </div>
      )}
    </div>
  );
}
