// components/NuevoRecibo/form.config.js

export const getToday = () => new Date().toISOString().split("T")[0];

export const createInitialForm = () => ({
  id: "",

  importe: "",

  fecha: getToday(),

  periodo: "",
});
