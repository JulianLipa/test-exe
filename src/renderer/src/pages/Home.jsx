import { useEffect, useState } from "react";
import DataHandler from "../components/DataHandler.jsx";
import { Link } from "react-router-dom";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();
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
        <Link to="/recibo">Recibo</Link>
        <Link to="/nuevoAlquiler">Alta Alquiler</Link>
      </div>
    </div>
  );
}

export default App;
