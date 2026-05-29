import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "@renderer/pages/Home";
import ReciboAlquiler from "@renderer/pages/ReciboAlquiler";
import NuevoAlquiler from "@renderer/pages/NuevoAlquiler";
import ListadoAlquiler from "@renderer/pages/ListadoAlquileres";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recibo" element={<ReciboAlquiler />} />
        <Route path="/nuevoAlquiler" element={<NuevoAlquiler />} />
        <Route path="/listadoAlquiler" element={<ListadoAlquiler />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
