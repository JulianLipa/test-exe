import PrintHeader from "../../components/PrintHeader";
import PrintPage from "../../components/PrintPage";

const LABELS = {
  aysaVto: "AYSA VTO",
  metrogasVto: "METROGAS VTO",
  inmobAblCuota: "INMOB/ABL CUOTA",
  edesur: "EDESUR",
  telefono: "TELÉFONO",
  expensasPeriodo: "EXPENSAS PERÍODO",
};

export default function ImpuestosImprimir({ form, alquiler, alquilerId }) {
  if (!alquilerId) return null;

  return (
    <PrintPage>
      <Copia form={form} alquiler={alquiler} alquilerId={alquilerId} />
      <Copia form={form} alquiler={alquiler} alquilerId={alquilerId} />
    </PrintPage>
  );
}

function Copia({ form, alquiler, alquilerId }) {
  const fecha = new Date().toLocaleDateString("es-AR");

  return (
    <div className="recibo-mitad">
      <PrintHeader />

      <hr className="border-0 border-t border-[#333] my-[5px]" />
      <h2 className="text-[1.15em] font-bold mb-[4px] uppercase tracking-[1px]">
        Comprobante de Recepción de Impuestos
      </h2>
      <hr className="border-0 border-t border-[#333] my-[5px]" />

      <div className="flex flex-col gap-[5px] my-[5px]">
        <Row label="Fecha" value={fecha} />
        <div className="h-[8px]" />
        <Row label="Contrato N°" value={alquilerId} />
        {alquiler && (
          <>
            <Row
              label="Locatario"
              value={`${alquiler.locatario?.apellido || ""}, ${alquiler.locatario?.nombre || ""}`}
            />
            <Row label="Inmueble" value={alquiler.inmueble?.direccion} />
          </>
        )}
      </div>

      <hr className="border-0 border-t border-[#333] my-[5px]" />

      <div className="flex flex-col gap-[5px] my-[5px]">
        {Object.entries(LABELS).map(([key, label]) =>
          form[key] ? <Row key={key} label={label} value={form[key]} /> : null,
        )}
      </div>

      {form.otros && (
        <>
          <hr className="border-0 border-t border-[#333] my-[5px]" />
          <div className="flex flex-col gap-[5px] my-[5px]">
            <Row label="OTROS" value={form.otros} />
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-[8px]">
      <span className="font-bold min-w-[110px] text-[1em]">{label}</span>
      <span className="font-medium text-[1em]">{value}</span>
    </div>
  );
}
