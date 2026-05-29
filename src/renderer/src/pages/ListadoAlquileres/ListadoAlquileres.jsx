import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { store } from "@renderer/services/store";

import styles from "./ListadoAlquileres.module.css";

export default function ListadoAlquileres() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const db = await store.loadDB();
        console.log("DB REAL:", db); // 👈 mirá esto en consola
        setData(db);
      } catch (err) {
        console.error(err);
        setData(null);
      }
    };

    getData();
  }, []);

  // ✅ NORMALIZADOR SEGURO
  const list = (() => {
    if (!data) return [];

    if (Array.isArray(data)) return data;

    // busca cualquier propiedad que sea array
    const found = Object.values(data).find((v) => Array.isArray(v));
    return found || [];
  })();

  return (
    <div className="montserrat flex flex-col gap-5">
      <Link to="/" className="">
        Volver
      </Link>

      <h2 className="">Listado de alquileres</h2>

      <table className="border-collapse border w-full">
        <thead>
          <tr>
            {list.length > 0 &&
              Object.keys(list[0]).map((key) => (
                <th key={key} className="border p-2 bg-gray-200 text-left">
                  {key}
                </th>
              ))}
          </tr>
        </thead>

        <tbody>
          {list.map((item, i) => (
            <tr key={i}>
              {Object.keys(list[0]).map((key) => (
                <td key={key} className="border p-2">
                  {typeof item[key] === "object"
                    ? JSON.stringify(item[key])
                    : String(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
