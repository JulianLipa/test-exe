import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ReciboAlquiler from "./pages/ReciboAlquiler/index.jsx";
import NuevoAlquiler from "./pages/NuevoAlquiler/index.jsx";
import ListadoAlquiler from "./pages/ListadoAlquileres/ListadoAlquileres.jsx";
import Impuestos from "./pages/Impuestos/index.jsx";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recibo" element={<ReciboAlquiler />} />
        <Route path="/nuevoAlquiler" element={<NuevoAlquiler />} />
        <Route path="/listadoAlquiler" element={<ListadoAlquiler />} />
        <Route path="/impuestos" element={<Impuestos />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
