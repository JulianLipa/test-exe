// components/NuevoRecibo/index.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createInitialForm } from "./form.config";

import {
  buildReciboPayload,
  formatCurrency,
  formatLabel,
  parseCurrencyInput,
  validateForm,
} from "./form.utils";

export default function NuevoRecibo({ alquiler }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(createInitialForm());

  // =========================
  // AUTOCOMPLETE ID
  // =========================

  useEffect(() => {
    if (!alquiler?.id) return;

    setForm((prev) => ({
      ...prev,

      id: alquiler.id,
    }));
  }, [alquiler]);

  // =========================
  // VALIDATION
  // =========================

  const isValid = validateForm(form);

  // =========================
  // HELPERS
  // =========================

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,

      [key]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      alert("Completar todos los campos");

      return;
    }

    try {
      const payload = buildReciboPayload({
        form,
      });

      const res = await window.store.addRecibo(payload);

      if (!res?.ok) {
        alert("Error al guardar recibo");

        return;
      }

      alert("Recibo guardado correctamente");

      navigate("/");
    } catch (err) {
      console.error(err);

      alert("Error inesperado");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* =========================
          ID
      ========================= */}

      <input
        type="number"
        placeholder={formatLabel("id")}
        value={form.id}
        onChange={(e) => setField("id", e.target.value)}
        className="bg-gray-100 border p-2 rounded"
      />

      {/* =========================
          IMPORTE
      ========================= */}

      <input
        type="text"
        placeholder={formatLabel("importe")}
        value={formatCurrency(form.importe)}
        onChange={(e) =>
          setField("importe", parseCurrencyInput(e.target.value))
        }
        className="border p-2 rounded"
      />

      {/* =========================
          FECHA
      ========================= */}

      <input
        type="date"
        value={form.fecha}
        onChange={(e) => setField("fecha", e.target.value)}
        className="border p-2 rounded"
      />

      {/* =========================
          PERIODO
      ========================= */}

      <input
        type="text"
        placeholder="Periodo"
        value={form.periodo}
        onChange={(e) => setField("periodo", e.target.value)}
        className="border p-2 rounded"
      />

      {/* =========================
          ACTIONS
      ========================= */}

      <button
        type="submit"
        disabled={!isValid}
        className="bg-black text-white p-2 rounded disabled:opacity-50"
      >
        Guardar
      </button>

      <Link className="flex items-center" to="/">
        Volver
      </Link>
    </form>
  );
}
