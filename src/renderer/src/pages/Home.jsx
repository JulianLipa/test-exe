import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addMonths,
  getNextMonth,
  monthName,
  getAlquileresQueActualizan,
  getAlquileresQueVencen,
} from "../utils/proximoMes.js";
import styles from "../components/CardDataHandler/CardDataHandler.module.css";

const ROUTES = {
  "1": "/nuevoAlquiler",
  "2": "/recibo",
  "3": "/impuestos",
  "4": "/papelRosa",
  "5": "/listadoAlquiler",
  "6": "/listadoRecibos",
  "7": "/listadoImpuestos",
  "8": "/listadoPapelRosa",
};


const badgeStyle = (tipo) => ({
  fontSize: "0.72em",
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: "4px",
  background: tipo === "vence" ? "rgba(248,113,113,0.18)" : "rgba(96,165,250,0.18)",
  color: tipo === "vence" ? "#f87171" : "#60a5fa",
  whiteSpace: "nowrap",
  letterSpacing: "0.03em",
  alignSelf: "flex-start",
});

function Home() {
  const navigate  = useNavigate();
  const navRef    = useRef(navigate);
  const scrollRef  = useRef(null);
  const [alquileres, setAlquileres]   = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) setCanScrollLeft(scrollRef.current.scrollLeft > 0);
  };

  useEffect(() => { navRef.current = navigate; });

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      const route = ROUTES[e.key];
      if (route) navRef.current(route);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.store.loadDB()
      .then((db) => setAlquileres(Array.isArray(db) ? db : []))
      .catch(() => {});
  }, []);

  const base = getNextMonth();
  const { year, month } = addMonths(base, monthOffset);
  const label = monthName(year, month);

  const actualizan = getAlquileresQueActualizan(alquileres, year, month);
  const vencen     = getAlquileresQueVencen(alquileres, year, month);
  const total      = actualizan.length + vencen.length;

  const preview = [
    ...vencen.map((a) => ({ ...a, _tipo: "vence" })),
    ...actualizan.map((a) => ({ ...a, _tipo: "actualiza" })),
  ];

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <div className="montserrat flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <h2>Actualizan/Vencen</h2>
        <button onClick={() => setMonthOffset((o) => o - 1)} style={{ fontSize: "1.1em", padding: "0 6px" }}>‹</button>
        <span style={{ minWidth: 110, textAlign: "center" }}>{label}</span>
        <button onClick={() => setMonthOffset((o) => o + 1)} style={{ fontSize: "1.1em", padding: "0 6px" }}>›</button>
        {monthOffset !== 0 && (
          <button onClick={() => setMonthOffset(0)} style={{ fontSize: "0.75em", opacity: 0.65 }}>hoy</button>
        )}
      </div>

      {total === 0 ? (
        <p className="thin">No hay alquileres que actualicen o venzan en {label}.</p>
      ) : (
        <>
          <div className={styles.wrapper}>
            {canScrollLeft && (
              <div className={styles.arrowLeft}>
                <button onClick={() => scroll(-1)}>‹</button>
              </div>
            )}
            <div ref={scrollRef} className={styles.container} onScroll={handleScroll} style={{ gap: "12px", padding: "4px 40px 4px 0" }}>
              {preview.map((item) => (
                <div
                  key={`${item._tipo}-${item.id}`}
                  style={{
                    border: "0.5px solid white",
                    borderRadius: "0.5em",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    flex: "0 0 auto",
                    width: "190px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "0.55em 1em", background: "white" }}>
                    <p className="thin" style={{ color: "rgb(var(--azul-900))", fontSize: "0.78em", margin: 0 }}>
                      ALQUILER N°{item.id}
                    </p>
                  </div>
                  <div style={{ padding: "0.7em 1em", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={badgeStyle(item._tipo)}>
                      {item._tipo === "actualiza" ? "Actualiza" : "Vence"}
                    </span>
                    <p style={{ color: "rgb(237,242,248)", fontWeight: 400, fontSize: "0.85em", margin: 0 }}>
                      {item.locatario?.apellido || "-"}, {item.locatario?.nombre || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.arrowRight}>
              <button onClick={() => scroll(1)}>›</button>
            </div>
          </div>
          <button
            onClick={() => navigate("/listadoProximoMes")}
            style={{ marginTop: 10, alignSelf: "flex-start" }}
          >
            Ver todos ({total})
          </button>
        </>
      )}

      <h2 className="mt-10 mb-2">Ingresar</h2>

      <div className="flex gap-5">
        <Link to="/nuevoAlquiler">[1] Alta Alquiler</Link>
        <Link to="/recibo">[2] Recibo</Link>
        <Link to="/impuestos">[3] Impuestos</Link>
        <Link to="/papelRosa">[4] Papel Rosa</Link>
      </div>

      <h2 className="mt-10 mb-2">Buscar</h2>

      <div className="flex gap-5">
        <Link to="/listadoAlquiler">[5] Alquileres</Link>
        <Link to="/listadoRecibos">[6] Recibos</Link>
        <Link to="/listadoImpuestos">[7] Impuestos</Link>
        <Link to="/listadoPapelRosa">[8] Papel rosa</Link>
      </div>
    </div>
  );
}

export default Home;
