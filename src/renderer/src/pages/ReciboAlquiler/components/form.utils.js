// components/NuevoRecibo/form.utils.js

export const formatCurrency = (value) => {
  if (!value) return "";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

export const parseCurrencyInput = (value) => {
  return value.replace(/[^\d]/g, "");
};

export const formatLabel = (text) => {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const validateForm = (form) => {
  return form.id && form.importe && form.fecha && form.periodo;
};

export const buildReciboPayload = ({ form }) => ({
  alquilerId: Number(form.id),

  importe: Number(form.importe),

  fecha: form.fecha,

  periodo: form.periodo,
});
