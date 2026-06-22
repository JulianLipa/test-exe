import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import ScrollTopTable from "../../components/ScrollTopTable/ScrollTopTable.jsx";
import {
  getNextMonth,
  monthName,
  getAlquileresQueActualizan,
  getAlquileresQueVencen,
} from "../../utils/proximoMes.js";

const fmtDate = (v) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("es-AR") : "-";

const firstWord = (str) => (str || "").trim().split(/\s+/)[0] || "-";
const displayPerson = (p) => `${firstWord(p?.apellido)}, ${firstWord(p?.nombre)}`;

const fmtMonto = (v) =>
  v != null && v !== "" ? `$${Number(v).toLocaleString("es-AR")}` : "-";

const getMontoValue = (item, n) => {
  if (item.montos?.length) {
    const found = item.montos.find((m) => m.numero === n);
    return found != null ? fmtMonto(found.monto) : "-";
  }
  return n === 1 ? fmtMonto(item.monto_inicial) : "-";
};

const getMaxMontoNum = (arr) => {
  let max = 1;
  for (const item of arr) {
    if (item.montos?.length) {
      for (const m of item.montos) {
        if (m.numero > max) max = m.numero;
      }
    }
  }
  return max;
};

const sortByFechaInicio = (arr) =>
  [...arr].sort((a, b) => {
    const da = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
    const db = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
    return da - db;
  });

function addMonths({ year, month }, n) {
  const total = year * 12 + month + n;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

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

const trHover = {
  borderBottom: "1px solid rgba(237,242,248,0.08)",
  transition: "background 0.15s",
};

const sectionTitleStyle = {
  fontSize: "1.05em",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgb(237,242,248)",
  marginBottom: 6,
};

function AlquileresTable({ items, maxMontos }) {
  const sorted = sortByFechaInicio(items);
  const montoNums = Array.from({ length: maxMontos }, (_, i) => i + 1);

  return (
    <ScrollTopTable>
      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <thead>
          <tr>
            {["N°", "Locatario", "Locador", "Índice", "Inicio", "Fin", "Cada"].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
            {montoNums.map((n) => (
              <th key={`m${n}`} style={thStyle}>
                {maxMontos === 1 ? "Monto" : `Monto ${n}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr
              key={item.id}
              style={trHover}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={tdStyle}>{item.id}</td>
              <td style={tdStyle}>{displayPerson(item.locatario)}</td>
              <td style={tdStyle}>{displayPerson(item.locador)}</td>
              <td style={tdStyle}>{item.indice || "-"}</td>
              <td style={tdStyle}>{fmtDate(item.fecha_inicio)}</td>
              <td style={tdStyle}>{fmtDate(item.fecha_fin)}</td>
              <td style={tdStyle}>{item.actualizacion_meses ? `${item.actualizacion_meses}m` : "-"}</td>
              {montoNums.map((n) => (
                <td key={`m${n}`} style={tdStyle}>{getMontoValue(item, n)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollTopTable>
  );
}

export default function ListadoProximoMes() {
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showVolver, setShowVolver] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
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
    window.store
      .loadDB()
      .then((db) => setAlquileres(Array.isArray(db) ? db : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const base            = getNextMonth();
  const { year, month } = addMonths(base, monthOffset);
  const label           = monthName(year, month);
  const actualizan      = getAlquileresQueActualizan(alquileres, year, month);
  const vencen          = getAlquileresQueVencen(alquileres, year, month);
  const maxAct          = getMaxMontoNum(actualizan);
  const maxVen          = getMaxMontoNum(vencen);

  return (
    <div className="montserrat flex flex-col gap-6">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm 12mm; }
          .listado-print-content, .listado-print-content * { visibility: visible !important; }
          .listado-print-content {
            position: absolute; top: 0; left: 0; width: 100%;
            background: white !important;
            padding: 6mm 8mm; box-sizing: border-box;
            font-family: 'Montserrat', Arial, sans-serif;
          }
          .listado-print-content * { color: #111 !important; background: transparent !important; opacity: 1 !important; box-shadow: none !important; }
          .listado-print-content div, .listado-print-content section { overflow: visible !important; }
          .listado-print-content table { border-collapse: collapse !important; width: 100% !important; margin-bottom: 10mm !important; table-layout: auto !important; }
          .listado-print-content th { border: 1px solid #444 !important; padding: 3pt 7pt !important; background: #eeeeee !important; font-size: 9pt !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.03em !important; text-align: left !important; white-space: nowrap !important; }
          .listado-print-content td { border: 1px solid #666 !important; padding: 3pt 7pt !important; font-size: 10pt !important; white-space: nowrap !important; }
          .listado-print-content tr { background: white !important; }
          .print-title { font-size: 13pt !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.04em !important; margin: 0 0 5pt !important; color: #111 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-center gap-4 no-print">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Actualizan/Vencen</h2>
        <button onClick={() => setMonthOffset((o) => o - 1)} style={{ fontSize: "1.1em", padding: "0 6px" }}>‹</button>
        <span style={{ minWidth: 110, textAlign: "center" }}>{label}</span>
        <button onClick={() => setMonthOffset((o) => o + 1)} style={{ fontSize: "1.1em", padding: "0 6px" }}>›</button>
        {monthOffset !== 0 && (
          <button onClick={() => setMonthOffset(0)} style={{ fontSize: "0.75em", opacity: 0.65 }}>hoy</button>
        )}
        <button onClick={() => window.print()} style={{ marginLeft: "auto" }}>Imprimir</button>
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

      {loading ? (
        <p className="thin no-print">Cargando...</p>
      ) : (
        <div className="listado-print-content flex flex-col gap-8">

          {/* ── Vencen ── */}
          <section className="flex flex-col gap-2">
            <h3 style={sectionTitleStyle} className="print-title">
              Vencen en {label} ({vencen.length})
            </h3>
            {vencen.length === 0 ? (
              <p className="thin">Ninguno.</p>
            ) : (
              <AlquileresTable items={vencen} maxMontos={maxVen} />
            )}
          </section>

          {/* ── Actualizan ── */}
          <section className="flex flex-col gap-2">
            <h3 style={sectionTitleStyle} className="print-title">
              Actualizan en {label} ({actualizan.length})
            </h3>
            {actualizan.length === 0 ? (
              <p className="thin">Ninguno.</p>
            ) : (
              <AlquileresTable items={actualizan} maxMontos={maxAct} />
            )}
          </section>

        </div>
      )}
    </div>
  );
}
