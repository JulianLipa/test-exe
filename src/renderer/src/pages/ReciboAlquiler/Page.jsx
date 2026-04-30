import { Link } from "react-router-dom";
import { MONTHS } from "./constants/months";
import { formatCurrency, formatLabel } from "./utils/formatters";
import useReciboForm from "./hooks/useReciboForm";

export default function Page() {
  const { form, thisYear, setField, setPeriodo, reset, getData } =
    useReciboForm();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = getData();
    console.log("DATA FINAL:", data);

    try {
      const res = await window.store.addRecibo(data);

      if (res?.ok) {
        alert("Recibo guardado correctamente");
        reset();
      } else {
        alert("Error al guardar recibo");
      }
    } catch (err) {
      console.error(err);
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
          value={form.id}
          onChange={(e) => setField("id", e.target.value)}
        />

        <input
          type="text"
          placeholder={formatLabel("importe")}
          value={formatCurrency(form.importe)}
          onChange={(e) =>
            setField("importe", e.target.value.replace(/[^\d]/g, ""))
          }
        />

        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setField("fecha", e.target.value)}
        />

        <div className="flex gap-2">
          <select
            value={form.periodo.month}
            onChange={(e) => setPeriodo("month", e.target.value)}
          >
            <option value="">Mes</option>
            {MONTHS.map((m) => (
              <option key={m}>{m}</option>
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

        <button className="bg-black text-white p-2 rounded">Guardar</button>
      </form>

      <Link to="/" className="mt-3">
        Volver
      </Link>
    </div>
  );
}
