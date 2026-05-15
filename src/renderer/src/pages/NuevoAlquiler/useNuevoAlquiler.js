import { useEffect, useState } from "react";
import { formConfig } from "./config/formConfig";
import { createInitialForm } from "./utils/createInitialForm";

export const useNuevoAlquiler = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();

      const maxId = db.length ? Math.max(...db.map((e) => e.id)) : 0;

      const base = { id: maxId + 1 };

      const initialForm = createInitialForm(formConfig, base);

      setData(db);
      setForm(initialForm);
    };

    load();
  }, []);

  return { data, form, setForm };
};
