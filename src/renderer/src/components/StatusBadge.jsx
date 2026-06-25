const today = new Date().toISOString().split("T")[0];

export default function StatusBadge({ fecha_fin }) {
  if (!fecha_fin) return null;
  const vigente = fecha_fin >= today;
  return (
    <span className={vigente ? "badge-vigente" : "badge-vencido"}>
      {vigente ? "Vigente" : "Vencido"}
    </span>
  );
}
