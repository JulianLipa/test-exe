import PrintHeader from "../../components/PrintHeader";
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
    <div className="papel-rosa-print">
      <PrintHeader />
      <hr className="recibo-print__linea" />

      <div className="recibo-print__datos" style={{ marginBottom: 6 }}>
        <div className="recibo-print__row">
          <span className="recibo-print__label">Locador</span>
          <span className="recibo-print__value">{data.apellidoDueno ?? "-"}</span>
        </div>
        <div className="recibo-print__row">
          <span className="recibo-print__label">Período</span>
          <span className="recibo-print__value">{data.periodo ?? "-"}</span>
        </div>
      </div>

      <hr className="recibo-print__linea" />

      <div style={{ display: "flex", flexDirection: "column", gap: 3, margin: "4px 0" }}>
        {filas.map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{f.label}</span>
            <span style={{ fontWeight: 500 }}>{f.signo} {formatCurrency(f.value)}</span>
          </div>
        ))}
      </div>

      <hr className="recibo-print__linea" />

      <div className="recibo-print__importe">
        <span>Total a cobrar</span>
        <span>{formatCurrency(data.totalACobrar)}</span>
      </div>
    </div>
  );
}
