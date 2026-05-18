// pages/recibos/index.jsx

import { useState } from "react";

import BuscadorAlquiler from "./components/BuscadorAlquiler";
import ListaResultados from "./components/ListaResultados";
import NuevoRecibo from "./components/NuevoRecibo";

export default function Page() {
  const [resultados, setResultados] = useState([]);

  const [selectedAlquiler, setSelectedAlquiler] = useState(null);

  return (
    <div className="montserrat flex flex-col gap-6">
      <h2 className="text-xl">Ingresar recibo</h2>

      <BuscadorAlquiler setResultados={setResultados} />

      <ListaResultados
        resultados={resultados}
        selectedAlquiler={selectedAlquiler}
        setSelectedAlquiler={setSelectedAlquiler}
      />

      <NuevoRecibo alquiler={selectedAlquiler} />
    </div>
  );
}
