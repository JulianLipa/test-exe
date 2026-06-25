import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import PrinterIcon from "../../components/PrinterIcon";
import PapelRosaImprimir from "./PapelRosaImprimir";
import { formatCurrency, parseCurrencyInput } from "../ReciboAlquiler/components/form.utils";
import { alquilerMatchesQuery } from "../../utils/search.js";
import { fmtDate } from "../../utils/formatters.js";
import ContratoModal from "../../components/ContratoModal.jsx";
import RecibosImpuestosModal from "../../components/RecibosImpuestosModal.jsx";
import { usePrint } from "../../hooks/usePrint";

// ── helpers ──────────────────────────────────────────────────────────────────

const num = (v) => Number(String(v).replace(/[^\d]/g, "")) || 0;

const IMPUESTO_LABELS = {
  aysaVto:         "AYSA VTO",
  metrogasVto:     "METROGAS VTO",
  inmobAblCuota:   "INMOB/ABL CUOTA",
  edesur:          "EDESUR",
  telefono:        "TELÉFONO",
  expensasPeriodo: "EXPENSAS PERÍODO",
  otros:           "OTROS",
};

// ── estilos internos ──────────────────────────────────────────────────────────

const labelStyle = {
  fontSize: "0.75em",
  opacity: 0.55,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: 600,
};

const infoLabelStyle = {
  fontSize: "0.75em",
  color: "rgba(237,242,248,0.5)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const infoValueStyle = {
  fontSize: "0.9em",
  color: "rgb(237,242,248)",
  fontWeight: 500,
};

// ── componente principal ──────────────────────────────────────────────────────

export default function PapelRosa() {
  const navigate = useNavigate();
  const navRef = useRef(navigate);
  useEffect(() => { navRef.current = navigate; });

  // búsqueda
  const [contratoInput, setContratoInput] = useState("");
  const [alquiler, setAlquiler]           = useState(null);
  const [lastImpuesto, setLastImpuesto]   = useState(null);
  const [lastRecibo, setLastRecibo]       = useState(null);
  const [notFound, setNotFound]           = useState(false);
  const [resultados, setResultados]       = useState([]);
  const [showModal, setShowModal]                   = useState(false);
  const [showRecibosModal, setShowRecibosModal]     = useState(false);
  const [showImpuestosModal, setShowImpuestosModal] = useState(false);

  // form
  const [apellidoDueno, setApellidoDueno] = useState("");
  const [periodo, setPeriodo]             = useState("");
  const [montoTotal, setMontoTotal]       = useState("");
  const [expExtr, setExpExtr]             = useState("");
  const [expExtrPeriodo, setExpExtrPeriodo] = useState("");
  const [deducciones, setDeducciones]     = useState([{ id: 1, label: "", value: "" }]);
  const [honorarios, setHonorarios]       = useState("");
  const [ingresos, setIngresos] = useState([{ id: 1, label: "", value: "" }]);

  // modales
  const [showVolver, setShowVolver]     = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [printTarget, setPrintTarget]   = useState(null);
  const { triggerPrint, portal } = usePrint();

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "-") setShowVolver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── buscar contrato ─────────────────────────────────────────────────────────

  const aplicarAlquiler = async (alq) => {
    try {
      const [impuestos, recibos] = await Promise.all([
        window.store.getImpuestos(),
        window.store.getRecibos(),
      ]);
      const alqIdStr = String(alq.id);
      const impDe = impuestos
        .filter((i) => String(i.alquilerId) === alqIdStr)
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
      const recDe = recibos
        .filter((r) => String(r.alquilerId ?? r.id) === alqIdStr)
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

      setAlquiler(alq);
      setLastImpuesto(impDe[0] || null);
      setLastRecibo(recDe[0] || null);
      setResultados([]);
      setNotFound(false);

      setApellidoDueno(alq.locador?.apellido || "");
      if (recDe[0]) {
        const imp = Number(recDe[0].importe) || 0;
        const honPct = Number(alq.honorario) || 0;
        setMontoTotal(String(imp));
        setHonorarios(String(Math.round(imp * honPct / 100)));
        setPeriodo(recDe[0].periodo || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuscar = async () => {
    if (!contratoInput.trim()) return;
    setNotFound(false);
    setAlquiler(null);
    setLastImpuesto(null);
    setLastRecibo(null);
    setResultados([]);
    try {
      const alquileres = await window.store.loadDB();
      const matches = alquileres.filter((a) => alquilerMatchesQuery(a, contratoInput.trim()));
      if (matches.length === 0) { setNotFound(true); return; }
      if (matches.length === 1) { await aplicarAlquiler(matches[0]); return; }
      setResultados(matches);
    } catch (err) {
      console.error(err);
    }
  };

  // ── cálculo total ───────────────────────────────────────────────────────────

  const totalDeducciones = deducciones.reduce((acc, d) => acc + num(d.value), 0);
  const totalIngresos    = ingresos.reduce((acc, d) => acc + num(d.value), 0);
  const totalACobrar =
    num(montoTotal) - num(expExtr) - num(honorarios) - totalDeducciones + totalIngresos;

  // ── deducciones dinámicas ───────────────────────────────────────────────────

  const addDeduccion = () =>
    setDeducciones((prev) => [...prev, { id: Date.now(), label: "", value: "" }]);

  const removeDeduccion = (id) =>
    setDeducciones((prev) => prev.filter((d) => d.id !== id));

  const updateDeduccion = (id, field, val) =>
    setDeducciones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d))
    );

  const addIngreso = () =>
    setIngresos((prev) => [...prev, { id: Date.now(), label: "", value: "" }]);

  const removeIngreso = (id) =>
    setIngresos((prev) => prev.filter((d) => d.id !== id));

  const updateIngreso = (id, field, val) =>
    setIngresos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d))
    );

  // ── guardar ─────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!alquiler) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    const payload = {
      alquilerId: alquiler?.id,
      locador: alquiler?.locador,
      locatario: alquiler?.locatario,
      inmueble: alquiler?.inmueble,
      apellidoDueno,
      periodo,
      montoTotal: num(montoTotal),
      expExtrPeriodo,
      expExtr: num(expExtr),
      deducciones: deducciones.map((d) => ({ label: d.label, value: num(d.value) })),
      honorarios: num(honorarios),
      ingresos: ingresos.map((d) => ({ label: d.label, value: num(d.value) })),
      totalACobrar,
      fecha: new Date().toISOString().split("T")[0],
    };
    const res = await window.store.addPapelRosa(payload);
    if (!res?.ok) { alert("Error al guardar"); return; }
    setShowConfirm(false);
    setPrintTarget(payload);
    setShowSuccess(true);
  };

  const handleImprimir = () => {
    triggerPrint(<PapelRosaImprimir data={printTarget} />);
    setTimeout(() => navRef.current("/"), 400);
  };

  const resetForm = () => {
    setContratoInput("");
    setAlquiler(null);
    setLastImpuesto(null);
    setLastRecibo(null);
    setResultados([]);
    setShowModal(false);
    setShowRecibosModal(false);
    setShowImpuestosModal(false);
    setApellidoDueno("");
    setPeriodo("");
    setMontoTotal("");
    setExpExtr("");
    setExpExtrPeriodo("");
    setDeducciones([{ id: 1, label: "", value: "" }]);
    setHonorarios("");
    setIngresos([{ id: 1, label: "", value: "" }]);
    setPrintTarget(null);
    setShowSuccess(false);
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="montserrat flex flex-col gap-5">

      {/* cabecera */}
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Papel Rosa</h2>
      </div>

      {/* búsqueda */}
      <div className="flex items-center gap-3">
        <label style={labelStyle}>Buscar</label>
        <input
          type="text"
          value={contratoInput}
          onChange={(e) => setContratoInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          style={{ width: 240 }}
          placeholder="N° contrato exacto o apellido/nombre"
          autoFocus
        />
        <button type="button" onClick={handleBuscar}>Buscar</button>
      </div>

      {notFound && (
        <p style={{ color: "#f87171", fontSize: "0.9em" }}>
          No se encontró ningún contrato para "{contratoInput}".
        </p>
      )}

      {resultados.length > 1 && (
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: "0.85em", color: "rgba(237,242,248,0.6)" }}>
            Se encontraron {resultados.length} contratos. Seleccioná uno:
          </p>
          <div className="flex gap-3 flex-wrap">
            {resultados.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => aplicarAlquiler(a)}
                style={{
                  background: "rgba(237,242,248,0.06)",
                  border: "1px solid rgba(237,242,248,0.15)",
                  borderRadius: "0.5em",
                  padding: "10px 14px",
                  textAlign: "left",
                  color: "rgb(237,242,248)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "0.9em" }}>N° {a.id}</span>
                <span style={{ fontSize: "0.8em", color: "rgba(237,242,248,0.75)" }}>
                  <span style={{ opacity: 0.55 }}>Locador: </span>{a.locador?.apellido || "-"}, {a.locador?.nombre || "-"}
                </span>
                <span style={{ fontSize: "0.8em", color: "rgba(237,242,248,0.75)" }}>
                  <span style={{ opacity: 0.55 }}>Locatario: </span>{a.locatario?.apellido || "-"}, {a.locatario?.nombre || "-"}
                </span>
                {a.inmueble?.direccion && (
                  <span style={{ fontSize: "0.75em", color: "rgba(237,242,248,0.4)" }}>{a.inmueble.direccion}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {alquiler && (
        <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.88em", color: "rgba(237,242,248,0.6)" }}>
            Contrato #{alquiler.id} — {alquiler.locador?.apellido} / {alquiler.locatario?.apellido}
          </span>
          <button type="button" style={{ fontSize: "0.82em", padding: "3px 10px" }} onClick={() => setShowModal(true)}>
            Ver datos del contrato
          </button>
          <button type="button" style={{ fontSize: "0.82em", padding: "3px 10px" }} onClick={() => setShowRecibosModal(true)}>
            Ver recibos
          </button>
          <button type="button" style={{ fontSize: "0.82em", padding: "3px 10px" }} onClick={() => setShowImpuestosModal(true)}>
            Ver impuestos
          </button>
        </div>
      )}

      {showModal && <ContratoModal alquiler={alquiler} onClose={() => setShowModal(false)} />}
      {showRecibosModal && <RecibosImpuestosModal alquiler={alquiler} mode="recibos" onClose={() => setShowRecibosModal(false)} />}
      {showImpuestosModal && <RecibosImpuestosModal alquiler={alquiler} mode="impuestos" onClose={() => setShowImpuestosModal(false)} />}

      {/* datos encontrados */}
      {alquiler && (
        <>
          <div className="flex gap-5" style={{ flexWrap: "wrap" }}>

            {/* columna izq: último impuesto */}
            <div style={colBox}>
              <p style={colTitle}>Último impuesto ingresado</p>
              {lastImpuesto ? (
                <div className="flex flex-col gap-1">
                  <InfoRow label="Fecha" value={fmtDate(lastImpuesto.fecha)} />
                  {Object.entries(IMPUESTO_LABELS).map(([k, l]) =>
                    lastImpuesto[k] ? <InfoRow key={k} label={l} value={lastImpuesto[k]} /> : null
                  )}
                </div>
              ) : (
                <p style={{ fontSize: "0.85em", opacity: 0.5 }}>Sin impuestos registrados</p>
              )}
            </div>

            {/* columna der: última liquidación */}
            <div style={colBox}>
              <p style={colTitle}>Última liquidación</p>
              {lastRecibo ? (
                <div className="flex flex-col gap-1">
                  <InfoRow label="Período"   value={lastRecibo.periodo} />
                  <InfoRow label="Fecha"     value={fmtDate(lastRecibo.fecha)} />
                  <InfoRow label="Importe"   value={formatCurrency(lastRecibo.importe)} />
                  <InfoRow
                    label="Honorarios"
                    value={formatCurrency(
                      Math.round(Number(lastRecibo.importe) * (Number(alquiler.honorario) || 0) / 100)
                    )}
                  />
                </div>
              ) : (
                <p style={{ fontSize: "0.85em", opacity: 0.5 }}>Sin liquidaciones registradas</p>
              )}
            </div>

          </div>

          {/* formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ maxWidth: 560 }}>

            <Field label="Apellido del locador">
              <input value={apellidoDueno} onChange={(e) => setApellidoDueno(e.target.value)} />
            </Field>

            <Field label="Período">
              <input value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="Ej: Julio 2025" />
            </Field>

            <Field label="Monto total del alquiler">
              <input
                value={formatCurrency(montoTotal)}
                onChange={(e) => setMontoTotal(parseCurrencyInput(e.target.value))}
              />
            </Field>

            <Field label="Exp. extr. período">
              <div className="flex gap-2">
                <input
                  placeholder="Período"
                  value={expExtrPeriodo}
                  onChange={(e) => setExpExtrPeriodo(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  placeholder="Monto"
                  value={formatCurrency(expExtr)}
                  onChange={(e) => setExpExtr(parseCurrencyInput(e.target.value))}
                  style={{ width: 160 }}
                />
              </div>
            </Field>

            {/* deducciones dinámicas */}
            <div className="flex flex-col gap-2">
              <span style={labelStyle}>Deducciones</span>
              {deducciones.map((d) => (
                <div key={d.id} className="flex gap-2 items-center">
                  <input
                    placeholder="Concepto"
                    value={d.label}
                    onChange={(e) => updateDeduccion(d.id, "label", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    placeholder="Monto"
                    value={formatCurrency(d.value)}
                    onChange={(e) => updateDeduccion(d.id, "value", parseCurrencyInput(e.target.value))}
                    style={{ width: 140 }}
                  />
                  {deducciones.length > 1 && (
                    <button type="button" onClick={() => removeDeduccion(d.id)} style={{ opacity: 0.6 }}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDeduccion} style={{ alignSelf: "flex-start", fontSize: "0.85em" }}>
                + Agregar deducción
              </button>
            </div>

            <Field label="Honorarios">
              <input
                value={formatCurrency(honorarios)}
                onChange={(e) => setHonorarios(parseCurrencyInput(e.target.value))}
              />
            </Field>

            {/* ingresos dinámicos */}
            <div className="flex flex-col gap-2">
              <span style={labelStyle}>Abona / Ingresos</span>
              {ingresos.map((d) => (
                <div key={d.id} className="flex gap-2 items-center">
                  <input
                    placeholder="Concepto"
                    value={d.label}
                    onChange={(e) => updateIngreso(d.id, "label", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    placeholder="Monto"
                    value={formatCurrency(d.value)}
                    onChange={(e) => updateIngreso(d.id, "value", parseCurrencyInput(e.target.value))}
                    style={{ width: 140 }}
                  />
                  {ingresos.length > 1 && (
                    <button type="button" onClick={() => removeIngreso(d.id)} style={{ opacity: 0.6 }}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addIngreso} style={{ alignSelf: "flex-start", fontSize: "0.85em" }}>
                + Agregar ingreso
              </button>
            </div>

            {/* total calculado */}
            <div style={{ borderTop: "1px solid rgba(237,242,248,0.15)", paddingTop: 12 }}>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 700, fontSize: "1em" }}>Total a cobrar</span>
                <span style={{ fontWeight: 700, fontSize: "1.15em", color: totalACobrar >= 0 ? "#86efac" : "#f87171" }}>
                  {formatCurrency(totalACobrar)}
                </span>
              </div>
              <p style={{ fontSize: "0.72em", opacity: 0.45, marginTop: 4 }}>
                Monto total − exp. extr. − honorarios − deducciones + abona/ingresos
              </p>
            </div>

            <div className="flex gap-2 mb-5">
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setShowVolver(true)}>Cancelar</button>
            </div>

          </form>
        </>
      )}

      {portal}

      {/* modales */}
      <ConfirmModal open={showVolver} onConfirm={() => navRef.current("/")} onCancel={() => setShowVolver(false)}>
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver al menú?</p>
          <div className="flex gap-2">
            <button onClick={() => navRef.current("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowVolver(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal open={showConfirm} onConfirm={confirmSave} onCancel={() => setShowConfirm(false)}>
        <div className="p-4">
          <p className="mb-4">¿Confirmar guardado del papel rosa?</p>
          <div className="flex gap-2">
            <button onClick={confirmSave} className="buttonBlack">Confirmar</button>
            <button onClick={() => setShowConfirm(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal open={showSuccess} onConfirm={handleImprimir} onCancel={() => navRef.current("/")}>
        <div className="p-4">
          <p className="mb-4">Papel rosa guardado correctamente</p>
          <div className="flex gap-2">
            <button onClick={handleImprimir} className="buttonBlack"><PrinterIcon /> Imprimir</button>
            <button onClick={resetForm}>Ingresar otro</button>
            <button onClick={() => navRef.current("/")}>Menú principal</button>
          </div>
        </div>
      </ConfirmModal>

    </div>
  );
}

// ── subcomponentes ────────────────────────────────────────────────────────────

const colBox = {
  flex: 1,
  minWidth: 240,
  background: "rgba(237,242,248,0.04)",
  border: "1px solid rgba(237,242,248,0.1)",
  borderRadius: 8,
  padding: "14px 16px",
};

const colTitle = {
  fontSize: "0.75em",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "rgba(237,242,248,0.45)",
  marginBottom: 10,
};

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ ...infoLabelStyle, minWidth: 130 }}>{label}</span>
      <span style={infoValueStyle}>{value ?? "-"}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

