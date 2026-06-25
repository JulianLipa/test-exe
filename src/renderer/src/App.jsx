import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ReciboAlquiler from "./pages/ReciboAlquiler/index.jsx";
import NuevoAlquiler from "./pages/NuevoAlquiler/index.jsx";
import ListadoAlquiler from "./pages/ListadoAlquileres/ListadoAlquileres.jsx";
import Impuestos from "./pages/Impuestos/index.jsx";
import ListadoRecibos from "./pages/ListadoRecibos/ListadoRecibos.jsx";
import ListadoImpuestos from "./pages/ListadoImpuestos/ListadoImpuestos.jsx";
import PapelRosa from "./pages/PapelRosa/PapelRosa.jsx";
import ListadoPapelRosa from "./pages/ListadoPapelRosa/ListadoPapelRosa.jsx";
import ListadoProximoMes from "./pages/ListadoProximoMes/ListadoProximoMes.jsx";

function App() {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        const el = document.activeElement;
        if (el && ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) {
          el.blur();
        }
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recibo" element={<ReciboAlquiler />} />
        <Route path="/nuevoAlquiler" element={<NuevoAlquiler />} />
        <Route path="/listadoAlquiler" element={<ListadoAlquiler />} />
        <Route path="/impuestos" element={<Impuestos />} />
        <Route path="/listadoRecibos" element={<ListadoRecibos />} />
        <Route path="/listadoImpuestos" element={<ListadoImpuestos />} />
        <Route path="/papelRosa" element={<PapelRosa />} />
        <Route path="/listadoPapelRosa" element={<ListadoPapelRosa />} />
        <Route path="/listadoProximoMes" element={<ListadoProximoMes />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
