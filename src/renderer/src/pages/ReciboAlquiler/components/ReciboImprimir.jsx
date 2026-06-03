import { formatCurrency } from "./form.utils";
import logo from "../../../imgs/LOGOTIPO-NEGATIVO-BG.svg";

export default function ReciboImprimir({ form, alquiler }) {
  if (!alquiler) return null;

  const fecha = form.fecha
    ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-AR")
    : "";

  return (
    <div className="recibo-print">

      <img src={logo} alt="Logo" className="recibo-print__logo" />

      <hr className="recibo-print__linea" />

      <h2 className="recibo-print__titulo">Recibo de Alquiler por Cuenta de Tercero</h2>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__datos">
        <Row label="Contrato N°" value={alquiler.id} />
        <Row label="Locatario"   value={alquiler.locatario?.apellido} />
        <Row label="Locador"     value={alquiler.locador?.apellido} />
        <Row label="Inmueble"    value={alquiler.inmueble?.direccion} />
        <Row label="Período"     value={form.periodo} />
        <Row label="Fecha"       value={fecha} />
      </div>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__importe">
        <span>Importe total</span>
        <span>{formatCurrency(form.importe)}</span>
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
