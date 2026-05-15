import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  if (!data) return null;

  const renderDefault = () => (
    <>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong>{" "}
          {typeof value === "object" ? JSON.stringify(value) : String(value)}
        </div>
      ))}
    </>
  );

  return (
    <div className={`montserrat ${styles.card}`}>
      {/* 🔹 HEADER */}
      <div className={`flex w-full bg-white ${styles.cardTitle}`}>
        {(data.type === "alquiler" && (
          <p className="thin">
            {data.type?.toUpperCase()} N°{data.id}
          </p>
        )) || <p className="thin">{data.type?.toUpperCase()}</p>}
      </div>

      <div className={`${styles.cardTitleDivContent}`}>
        {/* 🔹 ALQUILER */}
        {data.type === "alquiler" && (
          <div className={`${styles.noPadding}`}>
            <p>
              {data?.locador?.apellido} - {data?.locatario?.apellido}
            </p>
            <p>{data?.inmueble?.direccion}</p>
          </div>
        )}

        {/* 🔹 RECIBO */}
        {data.type === "recibo" && (
          <div className={`${styles.noPadding}`}>
            <p>Alquiler N°{data.id}</p>
            <p>{data?.nroAlquiler}</p>
            <p>Importe: ${data?.importe}</p>
            <p>{data?.periodo}</p>
          </div>
        )}

        {/* 🔹 FALLBACK (por si viene otra cosa) */}
        {!data.type && renderDefault()}
      </div>
    </div>
  );
};

export default CardDataHandler;
