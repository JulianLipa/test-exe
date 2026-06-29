import PrintHeader from "../../components/PrintHeader";
import PrintPage from "../../components/PrintPage";
import { formatCurrency } from "../ReciboAlquiler/components/form.utils";

export default function PapelRosaImprimir({ data }) {
  if (!data) return null;

  const filas = [
    { label: "Alquiler", value: data.montoTotal, signo: "+" },
    ...(data.expExtr ? [{ label: `Exp. extr.${data.expExtrPeriodo ? ` ${data.expExtrPeriodo}` : ""}`, value: data.expExtr, signo: "-" }] : []),
    ...(data.deducciones?.filter((d) => d.value).map((d) => ({ label: d.label || "Deducción", value: d.value, signo: "-" })) || []),
    { label: "Honorarios", value: data.honorarios, signo: "-" },
    ...(data.ingresos?.filter((d) => d.value).map((d) => ({ label: d.label || "Ingreso", value: d.value, signo: "+" })) || []),
  ];

  return (
    <PrintPage>
      <div className="recibo-mitad">
        <PrintHeader />
        <hr className="border-0 border-t border-[#333] my-[5px]" />

        <div className="flex flex-col gap-[5px] my-[5px] mb-[6px]">
          <Row label="Locador" value={data.apellidoDueno ?? "-"} />
          <Row label="Período" value={data.periodo ?? "-"} />
        </div>

        <hr className="border-0 border-t border-[#333] my-[5px]" />

        <div className="flex flex-col gap-[3px] my-[4px]">
          {filas.map((f, i) => (
            <div key={i} className="flex justify-between text-[1em]">
              <span className="font-semibold">{f.label}</span>
              <span className="font-medium">{f.signo} {formatCurrency(f.value)}</span>
            </div>
          ))}
        </div>

        <hr className="border-0 border-t border-[#333] my-[5px]" />

        <div className="flex justify-between mt-[6px] text-[1.08em] font-bold">
          <span>Total a cobrar</span>
          <span>{formatCurrency(data.totalACobrar)}</span>
        </div>
      </div>
    </PrintPage>
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
