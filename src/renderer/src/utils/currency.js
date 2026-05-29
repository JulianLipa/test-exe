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
