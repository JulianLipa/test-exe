import { useEffect, useState } from "react";

export const useNuevoAlquiler = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();

      const maxId = db.length ? Math.max(...db.map((e) => e.id)) : 0;

      setData(db);

      setForm({
        id: maxId + 1,
        locador: { apellido: "", nombre: "", direccion: "", telefono: "" },
        locatario: { apellido: "", nombre: "" },
        inmueble: { direccion: "", telefono: "" },
        impuestos: { AGIP: "", AYSA: "", EDESUR: "", METROGAS: "" },
        monto_inicial: "",
        fecha_inicio: "",
        fecha_fin: "",
        deposito_garantia: "",
        actualizacion_meses: "",
        indice: "",
      });
    };

    load();
  }, []);

  return { data, form, setForm };
};
