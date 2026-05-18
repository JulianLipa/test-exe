import { useEffect, useState } from "react";
import DataHandler from "../components/DataHandler.jsx";
import { Link } from "react-router-dom";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();
      setData(db || []);
      console.log(data);
    };

    load();
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
      </div>
    </div>
  );
}

export default App;
