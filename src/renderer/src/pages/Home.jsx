import { useEffect, useRef } from "react";
import DataHandler from "../components/DataHandler.jsx";
import { Link, useNavigate } from "react-router-dom";

const ROUTES = {
  "1": "/nuevoAlquiler",
  "2": "/recibo",
  "3": "/impuestos",
  "4": "/papelRosa",
  "5": "/listadoAlquiler",
  "6": "/listadoRecibos",
  "7": "/listadoImpuestos",
  "8": "/listadoPapelRosa",
};

function Home() {
  const navigate = useNavigate();
  const navRef = useRef(navigate);

  useEffect(() => { navRef.current = navigate; });

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      const route = ROUTES[e.key];
      if (route) navRef.current(route);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="montserrat flex flex-col">
      <h2 className="mb-2">Recientes</h2>

      <DataHandler />

      <h2 className="mt-10 mb-2">Ingresar</h2>

      <div className="flex gap-5">
        <Link to="/nuevoAlquiler">[1] Alta Alquiler</Link>
        <Link to="/recibo">[2] Recibo</Link>
        <Link to="/impuestos">[3] Impuestos</Link>
        <Link to="/papelRosa">[4] Papel Rosa</Link>
      </div>

      <h2 className="mt-10 mb-2">Ver</h2>

      <div className="flex gap-5">
        <Link to="/listadoAlquiler">[5] Listado alquileres</Link>
        <Link to="/listadoRecibos">[6] Listado recibos</Link>
        <Link to="/listadoImpuestos">[7] Listado impuestos</Link>
        <Link to="/listadoPapelRosa">[8] Listado papel rosa</Link>
      </div>
    </div>
  );
}

export default Home;
