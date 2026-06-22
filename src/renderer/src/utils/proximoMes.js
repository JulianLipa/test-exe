// Calcula el mes siguiente al actual.
// Devuelve { year, month } donde month es 0-indexed (como JS Date).
export function getNextMonth() {
  const today = new Date();
  const m = today.getMonth() + 1;
  return { year: m > 11 ? today.getFullYear() + 1 : today.getFullYear(), month: m % 12 };
}

// Nombre del mes capitalizado, ej: "Julio 2026"
export function monthName(year, month) {
  const s = new Date(year, month, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Devuelve los meses de actualización de un alquiler.
// Lógica: si inicia en enero y actualiza cada 3 meses,
// la primera actualización es en marzo (mes 3 desde inicio, contando el mes de inicio como 1).
// → offset del primer update = interval - 1 meses desde fecha_inicio.
// → cada update siguiente suma interval meses.
function getUpdateDates(alquiler) {
  const { fecha_inicio, fecha_fin, actualizacion_meses } = alquiler;
  if (!fecha_inicio || !actualizacion_meses) return [];

  const start = new Date(fecha_inicio + "T00:00:00");
  const end = fecha_fin ? new Date(fecha_fin + "T00:00:00") : null;
  const interval = Number(actualizacion_meses);
  if (!interval || interval <= 0) return [];

  const sy = start.getFullYear();
  const sm = start.getMonth();
  const result = [];

  for (let k = 1; k <= 600; k++) {
    const totalMonths = sm + interval * k - 1;
    const y = sy + Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    const d = new Date(y, m, 1);
    if (end && d > end) break;
    if (y > sy + 100) break;
    result.push({ year: y, month: m, index: k });
  }

  return result;
}

// Alquileres cuyo monto cambia en el mes {year, month}.
// Excluye contratos que vencen ese mismo mes (esos van solo a getAlquileresQueVencen).
// Cada item tiene _updateIndex: el número de actualización (1-based).
export function getAlquileresQueActualizan(alquileres, year, month) {
  const targetDate = new Date(year, month, 1);
  return alquileres
    .filter((a) => {
      if (!a.fecha_fin) {
        return getUpdateDates(a).some((u) => u.year === year && u.month === month);
      }
      const fin = new Date(a.fecha_fin + "T00:00:00");
      // vence antes del mes objetivo → ya terminó
      if (fin < targetDate) return false;
      // vence en este mismo mes → solo va a Vencen
      if (fin.getFullYear() === year && fin.getMonth() === month) return false;
      return getUpdateDates(a).some((u) => u.year === year && u.month === month);
    })
    .map((a) => {
      const u = getUpdateDates(a).find((u) => u.year === year && u.month === month);
      return { ...a, _updateIndex: u?.index };
    });
}

// Alquileres cuyo contrato vence en el mes {year, month}.
export function getAlquileresQueVencen(alquileres, year, month) {
  return alquileres.filter((a) => {
    if (!a.fecha_fin) return false;
    const fin = new Date(a.fecha_fin + "T00:00:00");
    return fin.getFullYear() === year && fin.getMonth() === month;
  });
}
