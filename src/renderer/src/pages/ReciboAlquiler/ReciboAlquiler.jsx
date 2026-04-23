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

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    id: { value: "", type: "number" },
    importe: { value: "", type: "money" },
    fecha: { value: today, type: "date" }, // ✅ default hoy
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      id: form.id.value,
      importe: Number(form.importe.value),
      fecha: form.fecha.value, // ✅ NUEVO
      periodo:
        form.periodo.month && form.periodo.year
          ? `${form.periodo.month} ${form.periodo.year}`
          : "",
    };

    console.log("DATA FINAL:", data);

    try {
      const res = await window.store.addRecibo(data);

      if (res?.ok) {
        alert("Recibo guardado correctamente");

        setForm({
          id: { value: "", type: "number" },
          importe: { value: "", type: "money" },
          fecha: { value: "", type: "date" }, // ✅ reset
          periodo: { month: "", year: "", type: "period" },
        });
      } else {
        alert("Error al guardar recibo");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error inesperado");
    }
  };

  return (
    <div className="montserrat flex flex-col">
      <h2 className="mt-10 mb-4">Ingresar alquiler</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="number"
          placeholder={formatLabel("id")}
          value={form.id.value}
          onChange={(e) => setField("id", e.target.value)}
        />

        <input
          type="text"
          placeholder={formatLabel("importe")}
          value={formatCurrency(form.importe.value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            setField("importe", raw);
          }}
        />

        {/* ✅ NUEVO CAMPO FECHA */}
        <input
          type="date"
          value={form.fecha.value}
          onChange={(e) => setField("fecha", e.target.value)}
        />

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
              return <option key={year}>{year}</option>;
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
