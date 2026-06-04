// components/DataHandler/CardDataHandler/CardDataHandler.jsx

import { useRef } from "react";
import { createPortal } from "react-dom";

import ReciboImprimir from "../../pages/ReciboAlquiler/components/ReciboImprimir";

import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  const cardRef = useRef(null);

  if (!data) return null;

  // =========================
  // TYPES
  // =========================

  const isAlquiler = data.type === "alquiler";

  const isRecibo = data.type === "recibo";

  // =========================
  // HELPERS
  // =========================

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("es-AR");
  };

  const formatPeriodo = (periodo) => {
    if (!periodo) return "-";

    if (typeof periodo === "string") {
      return periodo;
    }

    if (typeof periodo === "object") {
      return `${periodo.month || ""} ${periodo.year || ""}`;
    }

    return "-";
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div ref={cardRef} className={`montserrat ${styles.card}`}>
      {/* =========================
          HEADER
      ========================= */}

      <div className={`flex w-full bg-white ${styles.cardTitle}`}>
        <p className="thin">
          {data.type?.toUpperCase()}

          {isAlquiler && ` N°${data.id}`}
        </p>
      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className={styles.cardTitleDivContent}>
        {/* =========================
            ALQUILER
        ========================= */}

        {isAlquiler && (
          <div className={styles.noPadding}>
            <p>
              {data?.locador?.apellido} - {data?.locatario?.apellido}
            </p>

            <p>{data?.inmueble?.direccion}</p>
          </div>
        )}

        {/* =========================
            RECIBO
        ========================= */}

        {isRecibo && (
          <div className={styles.noPadding}>
            <p>
              Alquiler N°
              {data.alquilerId}
            </p>

            <p>Importe: ${formatCurrency(data?.importe)}</p>

            <p>{formatPeriodo(data?.periodo)}</p>

            <p>{data?.fecha}</p>

            <button
              type="button"
              onClick={() => {
                document
                  .querySelectorAll(".recibo-print")
                  .forEach((el) => el.classList.remove("recibo-print--active"));
                cardRef.current
                  ?.querySelector(".recibo-print")
                  ?.classList.add("recibo-print--active");
                window.print();
              }}
              className={styles.printButton}
            >
              Imprimir
            </button>
          </div>
        )}
      </div>

      {isRecibo && createPortal(
        <ReciboImprimir form={data} alquiler={data.alquiler} />,
        document.body
      )}
    </div>
  );
};

export default CardDataHandler;
