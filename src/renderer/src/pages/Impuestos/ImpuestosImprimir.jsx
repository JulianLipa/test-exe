import logo from "../../imgs/LOGOTIPO-NEGATIVO-BG.svg";

const LABELS = {
  aysaVto:         "AYSA VTO",
  metrogasVto:     "METROGAS VTO",
  inmobAblCuota:   "INMOB/ABL CUOTA",
  edesur:          "EDESUR",
  telefono:        "TELÉFONO",
  expensasPeriodo: "EXPENSAS PERÍODO",
};

export default function ImpuestosImprimir({ form, alquiler, alquilerId, printId }) {
  if (!alquilerId) return null;

  return (
    <div className="recibo-print" data-recibo-id={printId || `imp-${alquilerId}`}>
      <Copia form={form} alquiler={alquiler} alquilerId={alquilerId} />

      <div className="recibo-print__separador" />

      <Copia form={form} alquiler={alquiler} alquilerId={alquilerId} />
    </div>
  );
}

function Copia({ form, alquiler, alquilerId }) {
  const fecha = new Date().toLocaleDateString("es-AR");

  return (
    <>
      <img src={logo} alt="Logo" className="recibo-print__logo" />

      <hr className="recibo-print__linea" />

      <h2 className="recibo-print__titulo">Comprobante de Recepción de Impuestos</h2>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__datos">
        <Row label="Contrato N°" value={alquilerId} />
        {alquiler && (
          <>
            <Row label="Locatario" value={`${alquiler.locatario?.apellido || ""}, ${alquiler.locatario?.nombre || ""}`} />
            <Row label="Inmueble"  value={alquiler.inmueble?.direccion} />
          </>
        )}
        <Row label="Fecha" value={fecha} />
      </div>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__datos">
        {Object.entries(LABELS).map(([key, label]) =>
          form[key] ? <Row key={key} label={label} value={form[key]} /> : null
        )}
      </div>

      {form.otros && (
        <>
          <hr className="recibo-print__linea" />
          <div className="recibo-print__datos">
            <Row label="OTROS" value={form.otros} />
          </div>
        </>
      )}
    </>
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
