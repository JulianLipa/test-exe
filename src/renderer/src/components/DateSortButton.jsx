export default function DateSortButton({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label style={{ color: "rgba(237,242,248,0.6)", fontSize: "0.85em" }}>
        Fecha:
      </label>
      <button
        type="button"
        onClick={() => onChange(value === "asc" ? "desc" : "asc")}
        style={{ minWidth: 110 }}
      >
        {value === "asc" ? "↑ Más antigua" : "↓ Más reciente"}
      </button>
    </div>
  );
}
