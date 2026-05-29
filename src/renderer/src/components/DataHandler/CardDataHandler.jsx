import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  if (!data) return null;

  // =========================
  // TYPES
  // =========================

  const isAlquiler = data.type === "alquiler";

  const isRecibo = data.type === "recibo";

  // =========================
  // HELPERS
  // =========================

  // Number-only formatter (rendered with a literal "$" prefix in the JSX
  // below). Intentionally distinct from utils/currency's Intl ARS formatter.
  const formatNumber = (value) => {
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
    <div className={`montserrat ${styles.card}`}>
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
              {data.id}
            </p>

            <p>Importe: ${formatNumber(data?.importe)}</p>

            <p>{formatPeriodo(data?.periodo)}</p>

            <p>{data?.fecha}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDataHandler;
