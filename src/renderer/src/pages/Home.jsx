import { useEffect, useRef } from "react";
import DataHandler from "../components/DataHandler.jsx";
import { Link, useNavigate } from "react-router-dom";

const ROUTES = { "1": "/nuevoAlquiler", "2": "/listadoAlquiler", "3": "/recibo", "4": "/impuestos" };

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
        <Link to="/listadoAlquiler">[2] Listado alquileres</Link>
        <Link to="/recibo">[3] Recibo</Link>
        <Link to="/impuestos">[4] Impuestos</Link>
      </div>
    </div>
  );
}

export default Home;
