import { createPortal } from "react-dom";

import ReciboImprimir from "../../pages/ReciboAlquiler/components/ReciboImprimir";
import ImpuestosImprimir from "../../pages/Impuestos/ImpuestosImprimir";

import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  if (!data) return null;

  const isAlquiler  = data.type === "alquiler";
  const isRecibo    = data.type === "recibo";
  const isImpuesto  = data.type === "impuesto";

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

  return (
    <div className={`montserrat ${styles.card}`}>
      {/* HEADER */}
      <div className={`flex w-full bg-white ${styles.cardTitle}`}>
        <p className="thin">
          {data.type?.toUpperCase()}
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
              Imprimir
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
              Imprimir
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
    </div>
  );
};

export default CardDataHandler;
