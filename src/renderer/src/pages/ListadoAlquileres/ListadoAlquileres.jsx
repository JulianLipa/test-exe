import { Fragment, useEffect, useRef, useState } from "react";
import { alquilerMatchesQuery } from "../../utils/search.js";
import { fmtDate, fmtNum, calcTotalPeriodos } from "../../utils/formatters.js";
import { useListadoPage } from "../../hooks/useListadoPage.js";
import SearchBar from "../../components/SearchBar.jsx";
import VolverModal from "../../components/VolverModal.jsx";

const fmt = fmtNum;

const fmtPrice = (v) => {
  if (!v) return "";
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  if (isNaN(n) || n === 0) return "";
  return n.toLocaleString("es-AR");
};

const parsePrice = (str) => {
  const n = Number(
    String(str ?? "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
  return n || null;
};

const inputStyle = {
  background: "rgba(237,242,248,0.08)",
  color: "rgb(237,242,248)",
  border: "1px solid rgba(237,242,248,0.2)",
  borderRadius: "0.4em",
  padding: "4px 8px",
  fontSize: "0.88em",
};

const labelCol = {
  color: "rgba(237,242,248,0.45)",
  fontSize: "0.8em",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  paddingTop: 2,
};

const valueCol = {
  color: "rgb(237,242,248)",
  fontSize: "0.9em",
  wordBreak: "break-word",
};

const sectionLabel = {
  color: "rgba(237,242,248,0.35)",
  fontSize: "0.72em",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  gridColumn: "1 / -1",
  paddingTop: 4,
};

const divider = {
  gridColumn: "1 / -1",
  borderTop: "1px solid rgba(237,242,248,0.08)",
  margin: "4px 0",
};

function AlquilerCard({
  item,
  getMontoDisplay,
  handleMontoChange,
  handleMontoBlur,
  handleMontoSave,
  navRef,
}) {
  const total = calcTotalPeriodos(
    item.fecha_inicio,
    item.fecha_fin,
    item.actualizacion_meses,
  );
  const allNums = total
    ? Array.from({ length: total }, (_, i) => i + 1)
    : item.montos?.length
      ? item.montos.map((m) => m.numero)
      : null;

  const filledCount =
    allNums?.filter((num) => {
      const m = item.montos?.find((x) => x.numero === num);
      return m != null && m.monto;
    }).length ?? 0;

  const mainRows = [
    {
      label: "Locador",
      value: `${item.locador?.apellido ?? "-"}, ${item.locador?.nombre ?? "-"}`,
    },
    {
      label: "Locatario",
      value: `${item.locatario?.apellido ?? "-"}, ${item.locatario?.nombre ?? "-"}`,
    },
    { label: "Inmueble", value: item.inmueble?.direccion || "-" },
    { label: "Inicio", value: fmtDate(item.fecha_inicio) },
    { label: "Fin", value: fmtDate(item.fecha_fin) },
    {
      label: "Actualiz.",
      value: item.actualizacion_meses ? `${item.actualizacion_meses} meses` : "-",
    },
    { label: "Índice", value: item.indice || "-" },
    { label: "Honorario", value: item.honorario ? `${item.honorario}%` : "-" },
    {
      label: "Depósito",
      value: item.deposito_garantia ? `$${fmt(item.deposito_garantia)}` : "-",
    },
  ];

  const impRows = [
    { label: "AGIP",     value: item.impuestos?.AGIP     != null ? String(item.impuestos.AGIP)     : "-" },
    { label: "AYSA",     value: item.impuestos?.AYSA     != null ? String(item.impuestos.AYSA)     : "-" },
    { label: "Metrogas", value: item.impuestos?.METROGAS != null ? String(item.impuestos.METROGAS) : "-" },
    { label: "Edesur",   value: item.impuestos?.EDESUR   != null ? String(item.impuestos.EDESUR)   : "-" },
  ];

  return (
    <div
      className="mb-5!"
      style={{
        background: "rgba(237,242,248,0.04)",
        border: "1px solid rgba(237,242,248,0.1)",
        borderRadius: "0.7em",
        padding: "18px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: "1.05em", color: "rgb(237,242,248)" }}>
          Contrato #{item.id}
        </span>
        <button
          type="button"
          onClick={() => navRef.current("/nuevoAlquiler", { state: { editId: item.id } })}
        >
          Editar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "8px 24px" }}>
        {mainRows.map(({ label, value }) => (
          <Fragment key={label}>
            <span style={labelCol}>{label}</span>
            <span style={valueCol}>{value}</span>
          </Fragment>
        ))}

        <div style={divider} />
        <span style={sectionLabel}>Impuestos</span>

        {impRows.map(({ label, value }) => (
          <Fragment key={label}>
            <span style={labelCol}>{label}</span>
            <span style={valueCol}>{value}</span>
          </Fragment>
        ))}

        {allNums && (
          <>
            <div style={divider} />
            <span style={sectionLabel}>
              Montos{total != null ? ` — ${filledCount}/${total}` : ""}
              {total != null && filledCount < total && (
                <span style={{ color: "rgba(255,180,50,0.8)", marginLeft: 6 }}>incompleto</span>
              )}
            </span>

            <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
              {allNums.map((num) => (
                <div key={num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...labelCol, minWidth: 58 }}>Monto {num}</span>
                  <span style={{ color: "rgba(237,242,248,0.4)", fontSize: "0.85em" }}>$</span>
                  <input
                    type="text"
                    style={{ ...inputStyle, width: 110, textAlign: "right" }}
                    value={getMontoDisplay(item, num)}
                    placeholder="-"
                    onChange={(e) => handleMontoChange(item.id, num, e.target.value)}
                    onBlur={() => handleMontoBlur(item, num)}
                  />
                  <button
                    type="button"
                    style={{ padding: "2px 8px", fontSize: "0.8em" }}
                    onClick={() => handleMontoSave(item, num)}
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ListadoAlquileres() {
  const [allData, setAllData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [montoEdits, setMontoEdits] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searched, setSearched] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { navRef, showVolver, setShowVolver, goBack } = useListadoPage();
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.store.loadDB().then((db) => {
      const arr = Array.isArray(db) ? db : [];
      setAllData([...arr].sort((a, b) => new Date(b.fecha_inicio || 0) - new Date(a.fecha_inicio || 0)));
    });
  }, []);

  const handleSearch = () => {
    const query = searchInput.trim();
    if (!query) return;
    setLoading(true);
    setShowAll(false);
    setResults(
      allData
        .filter((a) => alquilerMatchesQuery(a, query))
        .sort((a, b) => new Date(b.fecha_inicio || 0) - new Date(a.fecha_inicio || 0))
    );
    setSearched(true);
    setLoading(false);
  };

  const handleVerTodos = () => {
    setShowAll(true);
    setSearched(false);
    setResults([]);
    setSearchInput("");
  };

  // ── monto helpers ─────────────────────────────────────────────────────────

  const getMontoDisplay = (item, numero) => {
    const key = `${item.id}_${numero}`;
    if (key in montoEdits) return montoEdits[key];
    const m = item.montos?.find((x) => x.numero === numero);
    return m?.monto ? fmtPrice(m.monto) : "";
  };

  const handleMontoChange = (itemId, numero, val) => {
    const cleaned = val.replace(/[^0-9.,]/g, "");
    setMontoEdits((prev) => ({ ...prev, [`${itemId}_${numero}`]: cleaned }));
  };

  const handleMontoBlur = (item, numero) => {
    const key = `${item.id}_${numero}`;
    if (!(key in montoEdits)) return;
    const v = parsePrice(montoEdits[key] ?? "");
    if (v) {
      setMontoEdits((prev) => ({ ...prev, [key]: fmtPrice(v) }));
    } else {
      setMontoEdits((prev) => { const c = { ...prev }; delete c[key]; return c; });
    }
  };

  const handleMontoSave = async (item, numero) => {
    const display = getMontoDisplay(item, numero);
    const value = parsePrice(display);
    try {
      const res = await window.store.updateMonto(item.id, numero, value);
      if (!res?.ok) { alert("Error al guardar el monto"); return; }
      const key = `${item.id}_${numero}`;
      setMontoEdits((prev) => {
        const c = { ...prev };
        if (value) { c[key] = fmtPrice(value); } else { delete c[key]; }
        return c;
      });
      setResults((prev) =>
        prev.map((i) => {
          if (i.id !== item.id) return i;
          const existing = i.montos?.find((m) => m.numero === numero);
          const newMontos = existing
            ? i.montos.map((m) => m.numero === numero ? { ...m, monto: value } : m)
            : [...(i.montos ?? []), { numero, monto: value }].sort((a, b) => a.numero - b.numero);
          return { ...i, montos: newMontos };
        }),
      );
    } catch (err) {
      console.error(err);
      alert("Error al guardar el monto");
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de alquileres</h2>
      </div>

      <SearchBar
        ref={firstInputRef}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={handleSearch}
        placeholder="N° contrato exacto, o apellido / nombre"
      >
        <button type="button" onClick={handleVerTodos}>Ver todos</button>
      </SearchBar>

      <VolverModal open={showVolver} onConfirm={goBack} onCancel={() => setShowVolver(false)} />

      {showAll ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "auto", borderCollapse: "collapse", fontSize: "0.85em" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(237,242,248,0.15)" }}>
                {["N°", "Locador", "Locatario", "Inmueble", "Inicio", "Fin"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "6px 12px",
                      color: "rgba(237,242,248,0.45)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.75em",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
                <th style={{ padding: "6px 12px" }} />
              </tr>
            </thead>
            <tbody>
              {allData.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(237,242,248,0.06)" }}>
                  <td style={{ padding: "8px 12px", color: "rgb(237,242,248)", fontWeight: 600, whiteSpace: "nowrap" }}>{item.id}</td>
                  <td style={{ padding: "8px 12px", color: "rgb(237,242,248)", whiteSpace: "nowrap" }}>
                    {item.locador?.apellido || "-"}, {item.locador?.nombre || "-"}
                  </td>
                  <td style={{ padding: "8px 12px", color: "rgb(237,242,248)", whiteSpace: "nowrap" }}>
                    {item.locatario?.apellido || "-"}, {item.locatario?.nombre || "-"}
                  </td>
                  <td style={{ padding: "8px 12px", color: "rgba(237,242,248,0.65)", whiteSpace: "nowrap" }}>
                    {item.inmueble?.direccion || "-"}
                  </td>
                  <td style={{ padding: "8px 12px", color: "rgba(237,242,248,0.65)", whiteSpace: "nowrap" }}>
                    {fmtDate(item.fecha_inicio)}
                  </td>
                  <td style={{ padding: "8px 12px", color: "rgba(237,242,248,0.65)", whiteSpace: "nowrap" }}>
                    {fmtDate(item.fecha_fin)}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <button
                      type="button"
                      style={{ fontSize: "0.8em", padding: "2px 8px" }}
                      onClick={() => navRef.current("/nuevoAlquiler", { state: { editId: item.id } })}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !searched ? (
        <p className="thin">Ingresá un N° de contrato exacto, o apellido / nombre para buscar.</p>
      ) : loading ? (
        <p className="thin">Buscando...</p>
      ) : results.length === 0 ? (
        <p className="thin">No se encontraron alquileres.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {results.map((item) => (
            <AlquilerCard
              key={item.id}
              item={item}
              getMontoDisplay={getMontoDisplay}
              handleMontoChange={handleMontoChange}
              handleMontoBlur={handleMontoBlur}
              handleMontoSave={handleMontoSave}
              navRef={navRef}
            />
          ))}
        </div>
      )}
    </div>
  );
}
