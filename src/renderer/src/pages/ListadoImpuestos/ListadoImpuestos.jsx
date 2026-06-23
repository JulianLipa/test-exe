import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import ImpuestosImprimir from "../Impuestos/ImpuestosImprimir";
import PrinterIcon from "../../components/PrinterIcon";
import ScrollTopTable from "../../components/ScrollTopTable/ScrollTopTable.jsx";
import { alquilerMatchesQuery } from "../../utils/search.js";
import { fmtDate } from "../../utils/formatters.js";
import { thStyle, tdStyle, trStyle } from "../../utils/tableStyles.js";

const COLS = [
  { label: "N°",              render: (i) => i.alquilerId ?? "-" },
  { label: "Locatario",       render: (i) => `${i.locatario?.apellido || "-"}, ${i.locatario?.nombre || "-"}` },
  { label: "Fecha",           render: (i) => fmtDate(i.fecha) },
  { label: "AYSA Vto.",       render: (i) => i.aysaVto || "-" },
  { label: "Metrogas Vto.",   render: (i) => i.metrogasVto || "-" },
  { label: "Inmob/ABL Cuota", render: (i) => i.inmobAblCuota || "-" },
  { label: "Edesur",          render: (i) => i.edesur || "-" },
  { label: "Teléfono",        render: (i) => i.telefono || "-" },
  { label: "Expensas",        render: (i) => i.expensasPeriodo || "-" },
  { label: "Otros",           render: (i) => i.otros || "-" },
];

const PRINT_ID = "imp-listado-print";

export default function ListadoImpuestos() {
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
    const el = document.querySelector(`[data-recibo-id="${PRINT_ID}"]`);
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
      const [todosImpuestos, todosAlquileres] = await Promise.all([
        window.store.getImpuestos(),
        window.store.loadDB(),
      ]);
      const matchingAlq = todosAlquileres.filter((a) => alquilerMatchesQuery(a, query));
      const matchingIds = new Set(matchingAlq.map((a) => String(a.id)));
      const alqMap = Object.fromEntries(matchingAlq.map((a) => [String(a.id), a]));
      const impuestos = todosImpuestos.filter((i) =>
        matchingIds.has(String(i.alquilerId ?? ""))
      );
      setData(
        impuestos.map((i) => {
          const alq = alqMap[String(i.alquilerId)];
          return { ...i, locatario: alq?.locatario, inmueble: alq?.inmueble };
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <h2>Listado de impuestos</h2>
      </div>

      <div className="flex items-center gap-4" style={{ flexWrap: "wrap" }}>
        <div className="flex items-center gap-2">
          <label style={{ color: "rgba(237,242,248,0.6)", fontSize: "0.85em" }}>Buscar:</label>
          <input
            ref={firstInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="N° contrato, ap. locador o locatario"
            style={{ width: 220 }}
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
        <p className="thin">Ingresá un N° de contrato, apellido de locador o locatario para buscar.</p>
      ) : loading ? (
        <p className="thin">Buscando...</p>
      ) : displayData.length === 0 ? (
        <p className="thin">No se encontraron impuestos.</p>
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
                  style={trStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {COLS.map((col) => (
                    <td key={col.label} style={tdStyle}>{col.render(item)}</td>
                  ))}
                  <td style={tdStyle}>
                    <button type="button" onClick={() => setPrintTarget(item)}>
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
        <ImpuestosImprimir
          form={printTarget}
          alquiler={{ locatario: printTarget.locatario, inmueble: printTarget.inmueble }}
          alquilerId={printTarget.alquilerId}
          printId={PRINT_ID}
        />
      )}
    </div>
  );
}
