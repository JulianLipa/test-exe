import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DataHandler } from "@renderer/components";
import { store } from "@renderer/services/store";

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const db = await store.loadDB();
      setData(db || []);
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

export default Home;
