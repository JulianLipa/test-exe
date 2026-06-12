import { useEffect, useState } from "react";
import { formConfig } from "./config/formConfig";
import { createInitialForm } from "./utils/createInitialForm";

export const useNuevoAlquiler = () => {
  const [form, setForm] = useState(() => createInitialForm(formConfig, { id: "" }));

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();
      const maxId = db.length ? Math.max(...db.map((e) => e.id)) : 0;
      setForm((prev) => ({ ...prev, id: maxId + 1 }));
    };
    load();
  }, []);

  return { form, setForm };
};
