import ReciboImprimir from "../../pages/ReciboAlquiler/components/ReciboImprimir";
import ImpuestosImprimir from "../../pages/Impuestos/ImpuestosImprimir";
import PapelRosaImprimir from "../../pages/PapelRosa/PapelRosaImprimir";
import { formatCurrency as fmtCur } from "../../pages/ReciboAlquiler/components/form.utils";
import PrinterIcon from "../PrinterIcon";
import { usePrint } from "../../hooks/usePrint";

import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  if (!data) return null;

  const isAlquiler  = data.type === "alquiler";
  const isRecibo    = data.type === "recibo";
  const isImpuesto  = data.type === "impuesto";
  const isPapelRosa = data.type === "papelrosa";

  const { triggerPrint, portal } = usePrint();

  const formatCurrency = (value) => Number(value || 0).toLocaleString("es-AR");

  const formatPeriodo = (periodo) => {
    if (!periodo) return "-";
    if (typeof periodo === "string") return periodo;
    if (typeof periodo === "object") return `${periodo.month || ""} ${periodo.year || ""}`;
    return "-";
  };

  return (
    <div className={`montserrat ${styles.card}`}>
      {/* HEADER */}
      <div className={`flex w-full bg-white ${styles.cardTitle}`}>
        <p className="thin">
          {isPapelRosa ? "PAPEL ROSA" : data.type?.toUpperCase()}
          {isAlquiler && ` N°${data.id}`}
        </p>
      </div>

      {/* CONTENT */}
      <div className={styles.cardTitleDivContent}>

        {/* ALQUILER */}
        {isAlquiler && (
          <div className={styles.noPadding}>
            <p>{data?.locador?.apellido} - {data?.locatario?.apellido}</p>
            <p>{data?.inmueble?.direccion}</p>
          </div>
        )}

        {/* RECIBO */}
        {isRecibo && (
          <div className={styles.noPadding}>
            <p>Alquiler N°{data.alquilerId}</p>
            <p>Importe: ${formatCurrency(data?.importe)}</p>
            <p>{formatPeriodo(data?.periodo)}</p>
            <p>{data?.fecha}</p>
            <button
              type="button"
              onClick={() => triggerPrint(<ReciboImprimir form={data} alquiler={data.alquiler} />)}
              className={styles.printButton}
            >
              <PrinterIcon size={12} />
            </button>
          </div>
        )}

        {/* PAPEL ROSA */}
        {isPapelRosa && (
          <div className={styles.noPadding}>
            <p>Contrato N°{data.alquilerId}</p>
            <p>{data.apellidoDueno}</p>
            <p>{data.periodo}</p>
            <p>Total: {fmtCur(data.totalACobrar)}</p>
            <button
              type="button"
              onClick={() => triggerPrint(<PapelRosaImprimir data={data} />)}
              className={styles.printButton}
            >
              <PrinterIcon size={12} />
            </button>
          </div>
        )}

        {/* IMPUESTO */}
        {isImpuesto && (
          <div className={styles.noPadding}>
            <p>Alquiler N°{data.alquilerId}</p>
            <p>{data.locatario?.apellido}, {data.locatario?.nombre}</p>
            <p>{data.inmueble?.direccion}</p>
            <p>{data.fecha}</p>
            <button
              type="button"
              onClick={() => triggerPrint(
                <ImpuestosImprimir
                  form={data}
                  alquiler={data.alquiler}
                  alquilerId={String(data.alquilerId)}
                />
              )}
              className={styles.printButton}
            >
              <PrinterIcon size={12} />
            </button>
          </div>
        )}
      </div>

      {portal}
    </div>
  );
};

export default CardDataHandler;
