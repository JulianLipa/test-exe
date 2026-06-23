export const normText = (str) =>
  String(str ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const alquilerMatchesQuery = (a, q) => {
  if (!q) return false;
  const trimmed = q.trim();
  if (!trimmed) return false;

  // Búsqueda numérica: coincidencia exacta de id
  if (/^\d+$/.test(trimmed)) {
    return String(a.id) === trimmed;
  }

  // Búsqueda de texto: normaliza y busca en apellidos y nombres
  const nq = normText(trimmed);
  const fields = [
    a.locador?.apellido   ?? "",
    a.locador?.nombre     ?? "",
    a.locatario?.apellido ?? "",
    a.locatario?.nombre   ?? "",
  ];
  return nq.split(/\s+/).filter(Boolean).every((word) =>
    fields.some((f) => normText(f).includes(word))
  );
};
