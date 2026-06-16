import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import ReciboImprimir from "../ReciboAlquiler/components/ReciboImprimir";
import { formatCurrency } from "../ReciboAlquiler/components/form.utils";

const fmtDate = (value) => {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("es-AR");
};

// Datos viejos pueden tener "periodo" como objeto, o usar "id" en vez de
// "alquilerId". Esto evita romper el render (React no acepta objetos como
// children) ante esos registros legacy.
const safeText = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return "-";
  return String(value);
};

const getAlquilerId = (r) => r.alquilerId ?? r.id ?? null;

// Normaliza registros viejos (id en vez de alquilerId, periodo objeto, etc.)
// para que ReciboImprimir / el resto de la pantalla siempre reciban tipos
// primitivos esperados.
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
  { label: "N°",         render: (r) => safeText(getAlquilerId(r)) },
  { label: "Locatario",  render: (r) => `${r.alquiler?.locatario?.apellido || "-"}, ${r.alquiler?.locatario?.nombre || "-"}` },
  { label: "Inmueble",   render: (r) => r.alquiler?.inmueble?.direccion || "-" },
  { label: "Período",    render: (r) => safeText(r.periodo) },
  { label: "Fecha",      render: (r) => fmtDate(r.fecha) },
  { label: "Importe",    render: (r) => formatCurrency(r.importe) || "-" },
];

export default function ListadoRecibos() {
  const [recibos, setRecibos]         = useState([]);
  const [alquileres, setAlquileres]   = useState([]);
  const [showVolver, setShowVolver]   = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const navigate = useNavigate();
  const navRef = useRef(navigate);
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
        const [rec, alq] = await Promise.all([
          window.store.getRecibos(),
          window.store.loadDB(),
        ]);
        setRecibos(Array.isArray(rec) ? rec : []);
        setAlquileres(Array.isArray(alq) ? alq : []);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
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

  const handleImprimir = (recibo) => {
    const alquiler = alquileres.find((a) => String(a.id) === String(recibo.alquilerId)) || null;
    if (!alquiler) { alert("No se encontró el alquiler asociado a este recibo"); return; }
    setPrintTarget({ recibo, alquiler });
  };

  const data = recibos.map(normalizeRecibo).map((r) => ({
    ...r,
    alquiler: alquileres.find((a) => String(a.id) === String(r.alquilerId)) || null,
  }));

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de recibos</h2>
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

      {data.length === 0 ? (
        <p className="thin">No hay recibos registrados.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
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
              {data.map((item, i) => (
                <tr
                  key={`${item.alquilerId}-${item.createdAt ?? i}`}
                  style={{
                    borderBottom: "1px solid rgba(237,242,248,0.08)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(237,242,248,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {COLS.map((col) => (
                    <td key={col.label} style={tdStyle}>{col.render(item)}</td>
                  ))}
                  <td style={tdStyle}>
                    <button type="button" onClick={() => handleImprimir(item)}>
                      Imprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {printTarget && (
        <ReciboImprimir form={printTarget.recibo} alquiler={printTarget.alquiler} />
      )}
    </div>
  );
}
