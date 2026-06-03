import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ConfirmModal from "../../../components/ConfirmModal";
import ReciboImprimir from "./ReciboImprimir";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
  // BACK
  // =========================
  const handleBack = () => {
    setShowConfirm(true);
  };

  const confirmBack = () => {
    navigate("/");
  };

  const cancelBack = () => {
    setShowConfirm(false);
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
      const payload = buildReciboPayload({ form });

      const res = await window.store.addRecibo(payload);

      if (!res?.ok) {
        alert("Error al guardar recibo");
        return;
      }

      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error inesperado");
    }
  };

  // =========================
  // SUCCESS ACTIONS
  // =========================
  const handleImprimir = () => {
    window.print();
    navigate("/");
  };

  const handleVolver = () => {
    navigate("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* ID */}
        <input
          type="number"
          placeholder={formatLabel("id")}
          value={form.id}
          onChange={(e) => setField("id", e.target.value)}
          className="bg-gray-100 border p-2 rounded"
        />

        {/* IMPORTE */}
        <input
          type="text"
          placeholder={formatLabel("importe")}
          value={formatCurrency(form.importe)}
          onChange={(e) =>
            setField("importe", parseCurrencyInput(e.target.value))
          }
          className="border p-2 rounded"
        />

        {/* FECHA */}
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setField("fecha", e.target.value)}
          className="border p-2 rounded"
        />

        {/* PERIODO */}
        <input
          type="text"
          placeholder="Periodo"
          value={form.periodo}
          onChange={(e) => setField("periodo", e.target.value)}
          className="border p-2 rounded"
        />

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isValid}
            className="bg-black text-white p-2 rounded disabled:opacity-50"
          >
            Guardar
          </button>

          <button type="button" onClick={handleBack} className="text-blue-600">
            Volver
          </button>
        </div>
      </form>

      <ReciboImprimir form={form} alquiler={alquiler} />

      {/* MODAL: recibo guardado */}
      <ConfirmModal open={showSuccess}>
        <div className="p-4">
          <p className="mb-4">Recibo guardado correctamente</p>

          <div className="flex gap-2">
            <button onClick={handleImprimir} className="buttonBlack">
              Imprimir recibo
            </button>

            <button onClick={handleVolver}>
              Volver al menú
            </button>
          </div>
        </div>
      </ConfirmModal>

      {/* MODAL: confirmar volver */}
      <ConfirmModal open={showConfirm}>
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver?</p>

          <div className="flex gap-2">
            <button onClick={confirmBack} className="buttonBlack">
              Sí
            </button>

            <button onClick={cancelBack}>
              Cancelar
            </button>
          </div>
        </div>
      </ConfirmModal>
    </>
  );
}
