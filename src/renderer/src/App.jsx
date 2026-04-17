import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ReciboAlquiler from "./pages/ReciboAlquiler.jsx";
import NuevoAlquiler from "./pages/NuevoAlquiler/index.jsx";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recibo" element={<ReciboAlquiler />} />
        <Route path="/nuevoAlquiler" element={<NuevoAlquiler />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
