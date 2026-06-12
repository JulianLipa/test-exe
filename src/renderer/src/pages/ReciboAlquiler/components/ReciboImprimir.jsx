import { formatCurrency } from "./form.utils";
import logo from "../../../imgs/LOGOTIPO-NEGATIVO-BG.svg";

export default function ReciboImprimir({ form, alquiler }) {
  if (!alquiler) return null;

  const fecha = form.fecha
    ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-AR")
    : "";

  const importe = Number(form.importe) || 0;
  const honorarioPct = Number(alquiler.honorario) || 0;
  const honorarios = importe * (honorarioPct / 100);
  const neto = importe - honorarios;

  return (
    <div className="recibo-print" data-recibo-id={form.id || form.alquilerId}>

      {/* ── RECIBO ── */}
      <img src={logo} alt="Logo" className="recibo-print__logo" />

      <hr className="recibo-print__linea" />

      <h2 className="recibo-print__titulo">
        Recibo de Alquiler por Cuenta de Tercero
      </h2>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__datos">
        <Row label="Contrato N°" value={alquiler.id} />
        <Row label="Locatario" value={alquiler.locatario?.apellido} />
        <Row label="Locador" value={alquiler.locador?.apellido} />
        <Row label="Inmueble" value={alquiler.inmueble?.direccion} />
        <Row label="Período" value={form.periodo} />
        <Row label="Fecha" value={fecha} />
      </div>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__importe">
        <span>Importe total</span>
        <span>{formatCurrency(importe)}</span>
      </div>

      {/* ── LIQUIDACION ── */}
      <div className="recibo-print__separador" />

      <img src={logo} alt="Logo" className="recibo-print__logo" />

      <hr className="recibo-print__linea" />

      <h2 className="recibo-print__titulo">Liquidación de Alquiler</h2>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__datos">
        <Row label="Señor/a" value={alquiler.locador?.nombre} />
        <Row label="Dirección" value={alquiler.locador?.direccion} />
        <Row label="Contrato N°" value={alquiler.id} />
        <Row label="Inmueble" value={alquiler.inmueble?.direccion} />
        <Row label="Período" value={form.periodo} />
        <Row label="Fecha" value={fecha} />
      </div>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__importe">
        <span>Total</span>
        <span>{formatCurrency(neto)}</span>
      </div>

    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="recibo-print__row">
      <span className="recibo-print__label">{label}</span>
      <span className="recibo-print__value">{value}</span>
    </div>
  );
}
