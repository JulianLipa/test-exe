import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import ConfirmModal from "../../components/ConfirmModal";
import PapelRosaImprimir from "../PapelRosa/PapelRosaImprimir";
import PrinterIcon from "../../components/PrinterIcon";
import { formatCurrency } from "../ReciboAlquiler/components/form.utils";
import ScrollTopTable from "../../components/ScrollTopTable/ScrollTopTable.jsx";
import { alquilerMatchesQuery } from "../../utils/search.js";
import { fmtDate } from "../../utils/formatters.js";
import { thStyle, tdStyle, trStyle } from "../../utils/tableStyles.js";

export default function ListadoPapelRosa() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [dateSort, setDateSort]       = useState("desc");
  const [showVolver, setShowVolver]   = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
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

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;
    setSearch(query);
    setLoading(true);
    try {
      const [todoPapel, todosAlquileres] = await Promise.all([
        window.store.getPapelRosa(),
        window.store.loadDB(),
      ]);
      const matchingIds = new Set(
        todosAlquileres.filter((a) => alquilerMatchesQuery(a, query)).map((a) => String(a.id))
      );
      setData((todoPapel ?? []).filter((p) => matchingIds.has(String(p.alquilerId ?? ""))));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!printTarget) return;
    const el = document.querySelector(".papel-rosa-print--listado .papel-rosa-print");
    if (el) el.classList.add("papel-rosa-print--active");
    const timer = setTimeout(() => {
      window.print();
      if (el) el.classList.remove("papel-rosa-print--active");
      setPrintTarget(null);
    }, 50);
    return () => clearTimeout(timer);
  }, [printTarget]);

  const rows = [...data].sort((a, b) => {
    const da = a.fecha ? new Date(a.fecha) : new Date(0);
    const db = b.fecha ? new Date(b.fecha) : new Date(0);
    return dateSort === "asc" ? da - db : db - da;
  });

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de papeles rosa</h2>
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

      {search.trim() === "" ? (
        <p className="thin">Ingresá un N° de contrato, apellido de locador o locatario para buscar.</p>
      ) : loading ? (
        <p className="thin">Buscando...</p>
      ) : rows.length === 0 ? (
        <p className="thin">No se encontraron papeles rosa.</p>
      ) : (
        <ScrollTopTable>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {["N°", "Locador", "Período", "Fecha", "Monto total", "Total a cobrar"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
                <th style={thStyle}><PrinterIcon /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => (
                <tr
                  key={`${item.alquilerId}-${item.createdAt ?? i}`}
                  style={trStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>{item.alquilerId ?? "-"}</td>
                  <td style={tdStyle}>{item.apellidoDueno || item.locador?.apellido || "-"}</td>
                  <td style={tdStyle}>{item.periodo || "-"}</td>
                  <td style={tdStyle}>{fmtDate(item.fecha)}</td>
                  <td style={tdStyle}>{formatCurrency(item.montoTotal)}</td>
                  <td style={tdStyle}>{formatCurrency(item.totalACobrar)}</td>
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

      <ConfirmModal open={showVolver} onConfirm={() => navRef.current("/")} onCancel={() => setShowVolver(false)}>
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver al menú?</p>
          <div className="flex gap-2">
            <button onClick={() => navRef.current("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowVolver(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      {printTarget && createPortal(
        <div className="papel-rosa-print--listado">
          <PapelRosaImprimir data={printTarget} />
        </div>,
        document.body
      )}
    </div>
  );
}
