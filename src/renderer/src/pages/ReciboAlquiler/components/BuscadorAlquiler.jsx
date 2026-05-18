// pages/recibos/components/BuscadorAlquiler.jsx

import { useState } from "react";

export default function BuscadorAlquiler({ setResultados }) {
  const [apellido, setApellido] = useState("");

  const handleSearch = async () => {
    try {
      if (!apellido.trim()) return;

      const data = await window.store.searchByApellidoLocatario(apellido);

      setResultados(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Apellido locatario"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        className="border p-2 rounded w-full"
      />

      <button
        onClick={handleSearch}
        className="bg-black text-white px-4 rounded"
      >
        Buscar
      </button>
    </div>
  );
}
