import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

export default function Page() {
  const thisYear = useMemo(() => new Date().getFullYear(), []);

  const [form, setForm] = useState({
    nroAlquiler: { value: "", type: "number" },
    importe: { value: "", type: "money" },
    periodo: { month: "", year: "", type: "period" },
  });

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const formatLabel = (text) => {
    if (!text) return "";
    const spaced = text.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const setPeriodo = (field, value) => {
    setForm((prev) => ({
      ...prev,
      periodo: {
        ...prev.periodo,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      nroAlquiler: form.nroAlquiler.value,
      importe: Number(form.importe.value),
      periodo:
        form.periodo.month && form.periodo.year
          ? `${form.periodo.month} ${form.periodo.year}`
          : "",
    };

    console.log("DATA FINAL:", data);
  };

  return (
    <div className="montserrat flex flex-col">
      <h2 className="mt-10 mb-4">Ingresar alquiler</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* NRO ALQUILER */}
        <input
          type="number"
          placeholder={formatLabel("nroAlquiler")}
          value={form.nroAlquiler.value}
          onChange={(e) => setField("nroAlquiler", e.target.value)}
        />

        {/* IMPORTE */}
        <input
          type="text"
          placeholder={formatLabel("importe")}
          value={formatCurrency(form.importe.value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            setField("importe", raw);
          }}
        />

        {/* PERIODO */}
        <div className="flex gap-2">
          <select
            value={form.periodo.month}
            onChange={(e) => setPeriodo("month", e.target.value)}
          >
            <option value="">Mes</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={form.periodo.year}
            onChange={(e) => setPeriodo("year", e.target.value)}
          >
            <option value="">Año</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = thisYear - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <button type="submit" className="bg-black text-white p-2 rounded">
          Guardar
        </button>
      </form>

      <Link to="/" className="mt-3">
        Volver
      </Link>
    </div>
  );
}
