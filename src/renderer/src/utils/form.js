import { getToday } from "./date";

// =========================
// NUEVO ALQUILER
// =========================

export const updateNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  const newObj = { ...obj };

  let current = newObj;

  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = { ...current[key] };
      current = current[key];
    }
  });

  return newObj;
};

export const createInitialForm = (config, base = {}) => {
  const form = { ...base };

  config.forEach((section) => {
    section.fields.forEach((field) => {
      const keys = field.name.split(".");
      let current = form;

      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          current[key] = "";
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    });
  });

  return form;
};

export const formatForm = (form) => ({
  ...form,
  id: Number(form.id),
  monto_inicial: Number(form.monto_inicial),
  deposito_garantia: Number(form.deposito_garantia),
  actualizacion_meses: Number(form.actualizacion_meses),
  indice: form.indice || null,
});

// =========================
// RECIBO
// =========================

export const createReciboForm = () => ({
  id: "",

  importe: "",

  fecha: getToday(),

  periodo: "",
});

export const validateForm = (form) => {
  return form.id && form.importe && form.fecha && form.periodo;
};

export const buildReciboPayload = ({ form }) => ({
  alquilerId: Number(form.id),

  importe: Number(form.importe),

  fecha: form.fecha,

  periodo: form.periodo,
});
