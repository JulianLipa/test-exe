import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import AlquilerSelector from "../../components/AlquilerSelector";
import ImpuestosImprimir from "./ImpuestosImprimir";
import PrinterIcon from "../../components/PrinterIcon";

const FIELDS = [
  { key: "aysaVto",         label: "AYSA VTO" },
  { key: "metrogasVto",     label: "METROGAS VTO" },
  { key: "inmobAblCuota",   label: "INMOB/ABL CUOTA" },
  { key: "edesur",          label: "EDESUR" },
  { key: "telefono",        label: "TELÉFONO" },
  { key: "expensasPeriodo", label: "EXPENSAS PERÍODO" },
];

const emptyForm = () => ({
  aysaVto: "", metrogasVto: "", inmobAblCuota: "",
  edesur: "", telefono: "", expensasPeriodo: "", otros: "",
});

export default function Impuestos() {
  const navigate = useNavigate();
  const navRef = useRef(navigate);
  useEffect(() => { navRef.current = navigate; });

  const [alquiler, setAlquiler]       = useState(null);
  const [alquilerId, setAlquilerId]   = useState("");
  const [form, setForm]               = useState(emptyForm());
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancel, setShowCancel]   = useState(false);
  const [showVolver, setShowVolver]   = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "-") setShowVolver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleAlquilerChange = (a, id) => {
    setAlquiler(a);
    setAlquilerId(id);
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!alquilerId) { alert("Seleccioná un locatario"); return; }
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    const payload = {
      alquilerId: Number(alquilerId),
      fecha: new Date().toISOString().split("T")[0],
      ...form,
    };
    const res = await window.store.addImpuesto(payload);
    if (!res?.ok) { alert("Error al guardar"); return; }
    setShowConfirm(false);
    setShowSuccess(true);
  };

  const handleImprimir = () => {
    const el = document.querySelector(`[data-recibo-id="imp-${alquilerId}"]`);
    if (el) el.classList.add("recibo-print--active");
    setTimeout(() => {
      window.print();
      if (el) el.classList.remove("recibo-print--active");
      navRef.current("/");
    }, 50);
  };

  const handleNuevo = () => {
    setAlquiler(null);
    setAlquilerId("");
    setForm(emptyForm());
    setShowSuccess(false);
  };

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Ingresar impuestos</h2>
      </div>

      <AlquilerSelector onChange={handleAlquilerChange} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-2xl">
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="thin" style={{ fontSize: "0.78em", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                className="border p-2 rounded"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="thin" style={{ fontSize: "0.78em", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>OTROS</span>
          <textarea
            value={form.otros}
            onChange={(e) => setField("otros", e.target.value)}
            rows={3}
            className="border p-2 rounded resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={!alquilerId} className="disabled:opacity-50">
            Guardar
          </button>
          <button type="button" onClick={() => setShowCancel(true)}>
            Cancelar
          </button>
        </div>
      </form>

      <ImpuestosImprimir form={form} alquiler={alquiler} alquilerId={alquilerId} />

      {/* Confirmar guardar */}
      <ConfirmModal open={showConfirm} onConfirm={confirmSave} onCancel={() => setShowConfirm(false)}>
        <div className="p-4">
          <p className="mb-4">¿Confirmar guardado de impuestos?</p>
          <div className="flex gap-2">
            <button onClick={confirmSave} className="buttonBlack">Confirmar</button>
            <button onClick={() => setShowConfirm(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      {/* Guardado OK */}
      <ConfirmModal open={showSuccess} onConfirm={handleImprimir} onCancel={() => navRef.current("/")}>
        <div className="p-4">
          <p className="mb-4">Impuestos guardados correctamente</p>
          <div className="flex gap-2">
            <button onClick={handleImprimir} className="buttonBlack"><PrinterIcon /> Imprimir</button>
            <button onClick={handleNuevo}>Ingresar otro</button>
            <button onClick={() => navRef.current("/")}>Menú principal</button>
          </div>
        </div>
      </ConfirmModal>

      {/* Cancelar ingreso */}
      <ConfirmModal open={showCancel} onConfirm={() => navRef.current("/")} onCancel={() => setShowCancel(false)}>
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés cancelar?</p>
          <div className="flex gap-2">
            <button onClick={() => navRef.current("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowCancel(false)}>Seguir ingresando</button>
          </div>
        </div>
      </ConfirmModal>

      {/* Volver con tecla */}
      <ConfirmModal open={showVolver} onConfirm={() => navRef.current("/")} onCancel={() => setShowVolver(false)}>
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver al menú?</p>
          <div className="flex gap-2">
            <button onClick={() => navRef.current("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowVolver(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
