export const formatForm = (form) => ({
  ...form,
  id: Number(form.id),
  monto_inicial: Number(form.monto_inicial),
  deposito_garantia: Number(form.deposito_garantia),
  actualizacion_meses: Number(form.actualizacion_meses),
  indice: form.indice || null,
});
