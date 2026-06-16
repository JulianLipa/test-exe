import { useEffect, useState } from "react";
import { formConfig } from "./config/formConfig";
import { createInitialForm } from "./utils/createInitialForm";

export const useNuevoAlquiler = (editId) => {
  const [form, setForm] = useState(() => createInitialForm(formConfig, { id: "" }));
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();

      if (editId != null) {
        const item = db.find((e) => String(e.id) === String(editId));
        if (item) {
          setForm({
            ...createInitialForm(formConfig, { id: item.id }),
            ...item,
          });
        }
        setLoading(false);
        return;
      }

      const maxId = db.length ? Math.max(...db.map((e) => e.id)) : 0;
      setForm((prev) => ({ ...prev, id: maxId + 1 }));
    };
    load();
  }, [editId]);

  return { form, setForm, loading };
};
