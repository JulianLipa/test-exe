import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AlertModal, ConfirmModal } from "@renderer/components/shared";
import {
  buildReciboPayload,
  createReciboForm,
  formatCurrency,
  formatLabel,
  parseCurrencyInput,
  validateForm,
} from "@renderer/utils";
import { store } from "@renderer/services/store";

export default function NuevoRecibo({ alquiler }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(createReciboForm());
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertState, setAlertState] = useState(null);

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
      setAlertState({ message: "Completar todos los campos" });
      return;
    }

    try {
      const payload = buildReciboPayload({ form });

      const res = await store.addRecibo(payload);

      if (!res?.ok) {
        setAlertState({ message: "Error al guardar recibo" });
        return;
      }

      setAlertState({
        message: "Recibo guardado correctamente",
        onClose: () => navigate("/"),
      });
    } catch (err) {
      console.error(err);
      setAlertState({ message: "Error inesperado" });
    }
  };

  const closeAlert = () => {
    const onClose = alertState?.onClose;
    setAlertState(null);
    onClose?.();
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

      {/* =========================
          MODALES (UNIFICADOS)
      ========================= */}
      <ConfirmModal
        open={showConfirm}
        title="¿Seguro que querés volver?"
        confirmLabel="Sí"
        cancelLabel="Cancelar"
        onConfirm={confirmBack}
        onCancel={cancelBack}
      />

      <AlertModal
        open={!!alertState}
        message={alertState?.message}
        onClose={closeAlert}
      />
    </>
  );
}
