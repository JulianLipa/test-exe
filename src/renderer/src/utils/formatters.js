export const fmtDate = (v) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("es-AR") : "-";

export const fmtNum = (v) =>
  v != null && v !== "" ? Number(v).toLocaleString("es-AR") : "-";

export const calcTotalPeriodos = (fechaInicio, fechaFin, actualizacionMeses) => {
  if (!fechaInicio || !fechaFin || !actualizacionMeses) return null;
  const d1 = new Date(fechaInicio + "T00:00:00");
  const d2 = new Date(fechaFin    + "T00:00:00");
  const totalMeses =
    (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  if (totalMeses <= 0) return null;
  return Math.ceil(totalMeses / Number(actualizacionMeses));
};
