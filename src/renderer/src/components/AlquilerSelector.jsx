import { useState } from "react";
import { alquilerMatchesQuery } from "../utils/search.js";
import ContratoCards from "./ContratoCards.jsx";
import ContratoModal from "./ContratoModal.jsx";
import RecibosImpuestosModal from "./RecibosImpuestosModal.jsx";

export default function AlquilerSelector({ onChange }) {
  const [query, setQuery]           = useState("");
  const [resultados, setResultados] = useState([]);
  const [alquiler, setAlquiler]     = useState(null);
  const [id, setId]                 = useState("");
  const [showModal, setShowModal]               = useState(false);
  const [showRecibosModal, setShowRecibosModal] = useState(false);
  const [showImpuestosModal, setShowImpuestosModal] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const db = await window.store.loadDB();
    if (!Array.isArray(db)) return;
    setResultados(db.filter((a) => alquilerMatchesQuery(a, query)));
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
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="N° contrato exacto o apellido/nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          className="border p-2 rounded w-full"
          autoFocus
        />
        <button type="button" onClick={handleSearch}>Buscar</button>
      </div>

      {resultados.length > 0 && (
        <ContratoCards alquileres={resultados} selectedId={alquiler?.id} onSelect={handleSelect} />
      )}

      <input
        type="number"
        placeholder="N° de contrato"
        value={id}
        onChange={(e) => handleIdChange(e.target.value)}
        className="border p-2 rounded"
      />

      {alquiler && (
        <div className="flex flex-col gap-2" style={{ fontSize: "0.88em" }}>
          <div className="flex flex-col gap-1 thin">
            <span style={{ opacity: 0.55 }}>Locador: <span style={{ opacity: 1 }}>{alquiler.locador?.apellido || "-"}, {alquiler.locador?.nombre || "-"}</span></span>
            <span style={{ opacity: 0.55 }}>Locatario: <span style={{ opacity: 1 }}>{alquiler.locatario?.apellido || "-"}, {alquiler.locatario?.nombre || "-"}</span></span>
            {alquiler.inmueble?.direccion && (
              <span style={{ opacity: 0.45 }}>{alquiler.inmueble.direccion}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{ fontSize: "0.82em", padding: "3px 10px" }}
            >
              Ver datos del contrato
            </button>
            <button
              type="button"
              onClick={() => setShowRecibosModal(true)}
              style={{ fontSize: "0.82em", padding: "3px 10px" }}
            >
              Ver recibos
            </button>
            <button
              type="button"
              onClick={() => setShowImpuestosModal(true)}
              style={{ fontSize: "0.82em", padding: "3px 10px" }}
            >
              Ver impuestos
            </button>
          </div>
        </div>
      )}

      {showModal && <ContratoModal alquiler={alquiler} onClose={() => setShowModal(false)} />}
      {showRecibosModal && <RecibosImpuestosModal alquiler={alquiler} mode="recibos" onClose={() => setShowRecibosModal(false)} />}
      {showImpuestosModal && <RecibosImpuestosModal alquiler={alquiler} mode="impuestos" onClose={() => setShowImpuestosModal(false)} />}
    </div>
  );
}
