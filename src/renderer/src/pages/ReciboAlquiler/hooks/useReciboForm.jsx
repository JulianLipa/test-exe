import { useState, useMemo } from "react";

export default function useReciboForm() {
  const thisYear = useMemo(() => new Date().getFullYear(), []);
  const today = new Date().toISOString().split("T")[0];

  const initialState = {
    id: "",
    importe: "",
    fecha: today,
    periodo: { month: "", year: "" },
  };

  const [form, setForm] = useState(initialState);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setPeriodo = (field, value) => {
    setForm((prev) => ({
      ...prev,
      periodo: { ...prev.periodo, [field]: value },
    }));
  };

  const reset = () => setForm(initialState);

  const getData = () => ({
    id: form.id,
    importe: Number(form.importe),
    fecha: form.fecha,
    periodo:
      form.periodo.month && form.periodo.year
        ? `${form.periodo.month} ${form.periodo.year}`
        : "",
  });

  return {
    form,
    thisYear,
    setField,
    setPeriodo,
    reset,
    getData,
  };
}
