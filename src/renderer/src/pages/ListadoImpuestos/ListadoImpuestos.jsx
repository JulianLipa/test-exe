import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import ImpuestosImprimir from "../Impuestos/ImpuestosImprimir";

const fmtDate = (value) => {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("es-AR");
};

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
  { label: "N°",              render: (i) => i.alquilerId ?? "-" },
  { label: "Locatario",       render: (i) => `${i.locatario?.apellido || "-"}, ${i.locatario?.nombre || "-"}` },
  { label: "Inmueble",        render: (i) => i.inmueble?.direccion || "-" },
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
        const list = await window.store.getImpuestos();
        setData(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
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

  const handleImprimir = (item) => setPrintTarget(item);

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de impuestos</h2>
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
        <p className="thin">No hay impuestos registrados.</p>
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
