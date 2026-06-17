import { createPortal } from "react-dom";

import ReciboImprimir from "../../pages/ReciboAlquiler/components/ReciboImprimir";
import ImpuestosImprimir from "../../pages/Impuestos/ImpuestosImprimir";
import PapelRosaImprimir from "../../pages/PapelRosa/PapelRosaImprimir";
import { formatCurrency as fmtCur } from "../../pages/ReciboAlquiler/components/form.utils";
import PrinterIcon from "../PrinterIcon";

import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  if (!data) return null;

  const isAlquiler  = data.type === "alquiler";
  const isRecibo    = data.type === "recibo";
  const isImpuesto  = data.type === "impuesto";
  const isPapelRosa = data.type === "papelrosa";

  const formatCurrency = (value) => Number(value || 0).toLocaleString("es-AR");

  const formatPeriodo = (periodo) => {
    if (!periodo) return "-";
    if (typeof periodo === "string") return periodo;
    if (typeof periodo === "object") return `${periodo.month || ""} ${periodo.year || ""}`;
    return "-";
  };

  const impPrintId = `imp-${data.alquilerId}-${data.createdAt}`;

  const handlePrintRecibo = () => {
    document.querySelectorAll(".recibo-print").forEach((el) => el.classList.remove("recibo-print--active"));
    document.querySelector(`.recibo-print[data-recibo-id="${data.alquilerId}"]`)?.classList.add("recibo-print--active");
    window.print();
  };

  const handlePrintImpuesto = () => {
    document.querySelectorAll(".recibo-print").forEach((el) => el.classList.remove("recibo-print--active"));
    document.querySelector(`.recibo-print[data-recibo-id="${impPrintId}"]`)?.classList.add("recibo-print--active");
    window.print();
  };

  const handlePrintPapelRosa = () => {
    document.querySelectorAll(".papel-rosa-print").forEach((el) => el.classList.remove("papel-rosa-print--active"));
    const wrapper = document.querySelector(`[data-papel-rosa-id="${data.createdAt}"]`);
    wrapper?.querySelector(".papel-rosa-print")?.classList.add("papel-rosa-print--active");
    window.print();
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
            <button type="button" onClick={handlePrintRecibo} className={styles.printButton}>
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
            <button type="button" onClick={handlePrintPapelRosa} className={styles.printButton}>
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
            <button type="button" onClick={handlePrintImpuesto} className={styles.printButton}>
              <PrinterIcon size={12} />
            </button>
          </div>
        )}
      </div>

      {isRecibo && createPortal(
        <ReciboImprimir form={data} alquiler={data.alquiler} />,
        document.body
      )}

      {isImpuesto && createPortal(
        <ImpuestosImprimir
          form={data}
          alquiler={data.alquiler}
          alquilerId={String(data.alquilerId)}
          printId={impPrintId}
        />,
        document.body
      )}

      {isPapelRosa && createPortal(
        <div data-papel-rosa-id={data.createdAt}>
          <PapelRosaImprimir data={data} />
        </div>,
        document.body
      )}
    </div>
  );
};

export default CardDataHandler;
