import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import ReciboImprimir from "../ReciboAlquiler/components/ReciboImprimir";
import { formatCurrency } from "../ReciboAlquiler/components/form.utils";
import PrinterIcon from "../../components/PrinterIcon";
import ScrollTopTable from "../../components/ScrollTopTable/ScrollTopTable.jsx";

const fmtDate = (value) => {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("es-AR");
};

const safeText = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return "-";
  return String(value);
};

const getAlquilerId = (r) => r.alquilerId ?? r.id ?? null;

const normalizeRecibo = (r) => ({
  ...r,
  alquilerId: getAlquilerId(r),
  periodo: typeof r.periodo === "string" || typeof r.periodo === "number" ? r.periodo : "",
});

const thStyle = {
  padding: "10px 14px",
  textAlign: "left",
  borderBottom: "1px solid rgba(237,242,248,0.2)",
  color: "rgba(237,242,248,0.5)",
  fontWeight: 600,
  fontSize: "0.78em",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 14px",
  color: "rgb(237,242,248)",
  fontWeight: 500,
  fontSize: "0.9em",
  whiteSpace: "nowrap",
};

const COLS = [
  { label: "N°",        render: (r) => safeText(getAlquilerId(r)) },
  { label: "Locatario", render: (r) => `${r.alquiler?.locatario?.apellido || "-"}, ${r.alquiler?.locatario?.nombre || "-"}` },
  { label: "Período",   render: (r) => safeText(r.periodo) },
  { label: "Fecha",     render: (r) => fmtDate(r.fecha) },
  { label: "Importe",   render: (r) => formatCurrency(r.importe) || "-" },
];

export default function ListadoRecibos() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showVolver, setShowVolver]   = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [dateSort, setDateSort]       = useState("desc");
  const navigate = useNavigate();
  const navRef = useRef(navigate);
  const firstInputRef = useRef(null);
  useEffect(() => { navRef.current = navigate; });
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "-") setShowVolver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!printTarget) return;
    const el = document.querySelector(`[data-recibo-id="${printTarget.recibo.alquilerId}"]`);
    if (el) el.classList.add("recibo-print--active");
    const timer = setTimeout(() => {
      window.print();
      if (el) el.classList.remove("recibo-print--active");
      setPrintTarget(null);
    }, 50);
    return () => clearTimeout(timer);
  }, [printTarget]);

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;
    setSearch(query);
    setLoading(true);
    try {
      const [recibos, alquileres] = await Promise.all([
        window.store.searchRecibosPorContrato(query),
        window.store.filtrarAlquileresPorId(query),
      ]);
      const alqMap = Object.fromEntries(alquileres.map((a) => [String(a.id), a]));
      setData(
        recibos.map((r) => {
          const norm = normalizeRecibo(r);
          return { ...norm, alquiler: alqMap[String(norm.alquilerId)] ?? null };
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = (recibo) => {
    if (!recibo.alquiler) { alert("No se encontró el alquiler asociado a este recibo"); return; }
    setPrintTarget({ recibo, alquiler: recibo.alquiler });
  };

  const displayData = [...data].sort((a, b) => {
    const da = a.fecha ? new Date(a.fecha) : new Date(0);
    const db = b.fecha ? new Date(b.fecha) : new Date(0);
    return dateSort === "asc" ? da - db : db - da;
  });

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de recibos</h2>
      </div>

      <div className="flex items-center gap-4" style={{ flexWrap: "wrap" }}>
        <div className="flex items-center gap-2">
          <label style={{ color: "rgba(237,242,248,0.6)", fontSize: "0.85em" }}>N° Contrato:</label>
          <input
            ref={firstInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar..."
            style={{ width: 120 }}
          />
          <button type="button" onClick={handleSearch}>Buscar</button>
        </div>
        <div className="flex items-center gap-2">
          <label style={{ color: "rgba(237,242,248,0.6)", fontSize: "0.85em" }}>Fecha:</label>
          <button
            type="button"
            onClick={() => setDateSort((s) => (s === "asc" ? "desc" : "asc"))}
            style={{ minWidth: 110 }}
          >
            {dateSort === "asc" ? "↑ Más antigua" : "↓ Más reciente"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showVolver}
        onConfirm={() => navRef.current("/")}
        onCancel={() => setShowVolver(false)}
      >
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver al menú?</p>
          <div className="flex gap-2">
            <button onClick={() => navRef.current("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowVolver(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      {search.trim() === "" ? (
        <p className="thin">Ingresá un N° de contrato para buscar.</p>
      ) : loading ? (
        <p className="thin">Buscando...</p>
      ) : displayData.length === 0 ? (
        <p className="thin">No se encontraron recibos para ese contrato.</p>
      ) : (
        <ScrollTopTable>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {COLS.map((col) => (
                  <th key={col.label} style={thStyle}>{col.label}</th>
                ))}
                <th style={thStyle}>Imprimir</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, i) => (
                <tr
                  key={`${item.alquilerId}-${item.fecha}-${i}`}
                  style={{ borderBottom: "1px solid rgba(237,242,248,0.08)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {COLS.map((col) => (
                    <td key={col.label} style={tdStyle}>{col.render(item)}</td>
                  ))}
                  <td style={tdStyle}>
                    <button type="button" onClick={() => handleImprimir(item)}>
                      <PrinterIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTopTable>
      )}

      {printTarget && (
        <ReciboImprimir form={printTarget.recibo} alquiler={printTarget.alquiler} />
      )}
    </div>
  );
}
