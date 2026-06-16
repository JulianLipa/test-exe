import { useEffect, useRef } from "react";
import DataHandler from "../components/DataHandler.jsx";
import { Link, useNavigate } from "react-router-dom";

const ROUTES = {
  "1": "/nuevoAlquiler",
  "2": "/recibo",
  "3": "/impuestos",
  "4": "/listadoAlquiler",
  "5": "/listadoRecibos",
  "6": "/listadoImpuestos",
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
      </div>

      <h2 className="mt-10 mb-2">Ver</h2>

      <div className="flex gap-5">
        <Link to="/listadoAlquiler">[4] Listado alquileres</Link>
        <Link to="/listadoRecibos">[5] Listado recibos</Link>
        <Link to="/listadoImpuestos">[6] Listado impuestos</Link>
      </div>
    </div>
  );
}

export default Home;
