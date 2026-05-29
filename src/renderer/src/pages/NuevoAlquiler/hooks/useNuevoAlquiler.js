import { useEffect, useState } from "react";

import { createInitialForm } from "@renderer/utils";
import { store } from "@renderer/services/store";

import { formConfig } from "../config/formConfig";

export const useNuevoAlquiler = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      const db = await store.loadDB();

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
