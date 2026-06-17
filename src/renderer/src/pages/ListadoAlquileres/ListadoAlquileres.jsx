import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

const fmt = (value) => {
  if (!value && value !== 0) return "-";
  return Number(value).toLocaleString("es-AR");
};

const fmtDate = (value) => {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("es-AR");
};

const selectStyle = {
  background: "rgba(237,242,248,0.08)",
  color: "rgb(237,242,248)",
  border: "1px solid rgba(237,242,248,0.2)",
  borderRadius: "0.4em",
  padding: "4px 8px",
  fontSize: "0.88em",
  cursor: "pointer",
};

const inputStyle = {
  background: "rgba(237,242,248,0.08)",
  color: "rgb(237,242,248)",
  border: "1px solid rgba(237,242,248,0.2)",
  borderRadius: "0.4em",
  padding: "4px 8px",
  fontSize: "0.88em",
  width: "100px",
};

const thBase = {
  padding: "10px 14px",
  textAlign: "left",
  borderBottom: "1px solid rgba(237,242,248,0.2)",
  color: "rgba(237,242,248,0.5)",
  fontWeight: 600,
  fontSize: "0.78em",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
  userSelect: "none",
};

const tdStyle = {
  padding: "10px 14px",
  color: "rgb(237,242,248)",
  fontWeight: 500,
  fontSize: "0.9em",
  whiteSpace: "nowrap",
};

// ── tipos de filtro por columna ───────────────────────────────────────────────
// "sort"   → alterna asc/desc al hacer click
// "search" → muestra un input de texto debajo del header
// "none"   → sin filtro

const COLS = [
  { key: "id",              label: "N°",              filter: "sort",   getValue: (a) => a.id },
  { key: "locador_ap",     label: "Locador Ap.",      filter: "search", getValue: (a) => a.locador?.apellido || "" },
  { key: "locador_nom",    label: "Locador Nom.",     filter: "search", getValue: (a) => a.locador?.nombre   || "" },
  { key: "locatario_ap",   label: "Locatario Ap.",    filter: "search", getValue: (a) => a.locatario?.apellido || "" },
  { key: "locatario_nom",  label: "Locatario Nom.",   filter: "search", getValue: (a) => a.locatario?.nombre   || "" },
  { key: "inmueble",       label: "Inmueble",         filter: "none",   getValue: (a) => a.inmueble?.direccion || "-" },
  { key: "fecha_inicio",   label: "Inicio",           filter: "sort",   getValue: (a) => a.fecha_inicio || "" },
  { key: "fecha_fin",      label: "Fin",              filter: "sort",   getValue: (a) => a.fecha_fin    || "" },
  { key: "montos",         label: "Montos",           filter: "none",   getValue: null },
  { key: "honorario",      label: "Honorario",        filter: "none",   getValue: (a) => a.honorario ? `${a.honorario}%` : "-" },
  { key: "indice",         label: "Índice",           filter: "none",   getValue: (a) => a.indice || "-" },
  { key: "actualizacion",  label: "Actualiz.",        filter: "none",   getValue: (a) => a.actualizacion_meses ? `${a.actualizacion_meses}m` : "-" },
  { key: "editar",         label: "Editar",           filter: "none",   getValue: null },
];

const initialSorts  = Object.fromEntries(COLS.filter((c) => c.filter === "sort").map((c) => [c.key, null]));
const initialSearch = Object.fromEntries(COLS.filter((c) => c.filter === "search").map((c) => [c.key, ""]));

export default function ListadoAlquileres() {
  const [data, setData]           = useState([]);
  const [showVolver, setShowVolver] = useState(false);
  const [montoEdits, setMontoEdits] = useState({});
  // sortOrder: array de { key, dir } en orden de prioridad (primero = más importante)
  const [sortOrder, setSortOrder] = useState([]);
  const [searches, setSearches]   = useState(initialSearch);
  const navigate = useNavigate();
  const navRef   = useRef(navigate);
  useEffect(() => { navRef.current = navigate; });

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "-") setShowVolver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const db = await window.store.loadDB();
        const list = Array.isArray(db)
          ? db
          : Object.values(db || {}).find((v) => Array.isArray(v)) || [];
        setData(list);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, []);

  // ── monto helpers ─────────────────────────────────────────────────────────

  const getMontoEdit = (a) => {
    const edit = montoEdits[a.id];
    if (edit) return edit;
    const primero = a.montos?.[0];
    return { numero: primero?.numero ?? "", value: primero?.monto ?? "" };
  };

  const handleMontoSelect = (a, numero) => {
    const encontrado = a.montos.find((m) => String(m.numero) === String(numero));
    setMontoEdits((prev) => ({ ...prev, [a.id]: { numero, value: encontrado?.monto ?? "" } }));
  };

  const handleMontoValueChange = (a, value) => {
    setMontoEdits((prev) => ({ ...prev, [a.id]: { ...getMontoEdit(a), value } }));
  };

  const handleMontoSave = async (a) => {
    const edit = getMontoEdit(a);
    if (!edit.numero) return;
    try {
      const res = await window.store.updateMonto(a.id, Number(edit.numero), Number(edit.value));
      if (!res?.ok) { alert("Error al guardar el monto"); return; }
      setData((prev) =>
        prev.map((item) =>
          item.id === a.id
            ? { ...item, montos: item.montos.map((m) => m.numero === Number(edit.numero) ? { ...m, monto: Number(edit.value) } : m) }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error al guardar el monto");
    }
  };

  // ── filtros ───────────────────────────────────────────────────────────────

  // Click: asc → desc → quitar. Si no estaba, se agrega al final (menor prioridad).
  const handleSortClick = (key) => {
    setSortOrder((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (!existing) return [...prev, { key, dir: "asc" }];
      if (existing.dir === "asc") return prev.map((s) => s.key === key ? { ...s, dir: "desc" } : s);
      return prev.filter((s) => s.key !== key);
    });
  };

  const handleSearchChange = (key, val) => {
    setSearches((prev) => ({ ...prev, [key]: val }));
  };

  // aplicar búsquedas de texto
  let rows = data.filter((a) =>
    COLS.filter((c) => c.filter === "search").every((c) => {
      const q = searches[c.key].trim().toLowerCase();
      if (!q) return true;
      return c.getValue(a).toLowerCase().includes(q);
    })
  );

  // aplicar ordenamientos en orden de prioridad (el primero clickeado es el primario)
  if (sortOrder.length) {
    const colMap = Object.fromEntries(COLS.map((c) => [c.key, c]));
    rows = [...rows].sort((a, b) => {
      for (const { key, dir } of sortOrder) {
        const col = colMap[key];
        if (!col?.getValue) continue;
        const cmp = String(col.getValue(a)).localeCompare(String(col.getValue(b)), "es", { numeric: true });
        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }

  // ── render ────────────────────────────────────────────────────────────────

  const renderCell = (col, item) => {
    if (col.key === "montos") {
      if (!item.montos?.length) return `$${fmt(item.monto_inicial)}`;
      const edit = getMontoEdit(item);
      return (
        <div className="flex items-center gap-2">
          <select style={selectStyle} value={edit.numero} onChange={(e) => handleMontoSelect(item, e.target.value)}>
            {item.montos.map((m) => (
              <option key={m.numero} value={m.numero} style={{ color: "rgb(14,25,37)" }}>
                {`Monto N°${m.numero}`}
              </option>
            ))}
          </select>
          <input
            type="number"
            style={inputStyle}
            value={edit.value}
            placeholder="Monto"
            onChange={(e) => handleMontoValueChange(item, e.target.value)}
          />
          <button type="button" onClick={() => handleMontoSave(item)}>Guardar</button>
        </div>
      );
    }
    if (col.key === "editar") {
      return (
        <button type="button" onClick={() => navRef.current("/nuevoAlquiler", { state: { editId: item.id } })}>
          Editar
        </button>
      );
    }
    if (col.key === "fecha_inicio") return fmtDate(item.fecha_inicio);
    if (col.key === "fecha_fin")    return fmtDate(item.fecha_fin);
    return col.getValue ? col.getValue(item) || "-" : "-";
  };

  const sortIcon = (key) => {
    const s = sortOrder.find((x) => x.key === key);
    const idx = sortOrder.findIndex((x) => x.key === key);
    if (!s) return " ↕";
    const num = sortOrder.length > 1 ? `${idx + 1}` : "";
    return s.dir === "asc" ? ` ↑${num}` : ` ↓${num}`;
  };

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de alquileres</h2>
      </div>

      <ConfirmModal open={showVolver} onConfirm={() => navRef.current("/")} onCancel={() => setShowVolver(false)}>
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver al menú?</p>
          <div className="flex gap-2">
            <button onClick={() => navRef.current("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowVolver(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      {data.length === 0 ? (
        <p className="thin">No hay alquileres registrados.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {COLS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      ...thBase,
                      cursor: col.filter !== "none" ? "pointer" : "default",
                    }}
                    onClick={() => col.filter === "sort" && handleSortClick(col.key)}
                  >
                    {col.label}
                    {col.filter === "sort" && sortIcon(col.key)}
                  </th>
                ))}
              </tr>
              <tr>
                {COLS.map((col) => (
                  <td key={col.key} style={{ padding: "4px 14px 8px" }}>
                    {col.filter === "search" && (
                      <input
                        type="text"
                        value={searches[col.key]}
                        onChange={(e) => handleSearchChange(col.key, e.target.value)}
                        placeholder="Buscar…"
                        style={{ ...inputStyle, width: "100%", minWidth: 80 }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => (
                <tr
                  key={item.id ?? i}
                  style={{ borderBottom: "1px solid rgba(237,242,248,0.08)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {COLS.map((col) => (
                    <td key={col.key} style={tdStyle}>{renderCell(col, item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
