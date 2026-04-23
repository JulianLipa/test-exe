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
      <p className="thin">{data.type?.toUpperCase()} N° {data.id}</p>

      {/* 🔹 ALQUILER */}
      {data.type === "alquiler" && (
        <>
          <p>{data.id}</p>
          <p>
            {data?.locador?.apellido} - {data?.locatario?.apellido}
          </p>
          <p>{data?.inmueble?.direccion}</p>
        </>
      )}

      {/* 🔹 RECIBO */}
      {data.type === "recibo" && (
        <>
          <p>{data?.nroAlquiler}</p>
          <p>Importe: ${data?.importe}</p>
          <p>{data?.periodo}</p>
        </>
      )}

      {/* 🔹 FALLBACK (por si viene otra cosa) */}
      {!data.type && renderDefault()}
    </div>
  );
};

export default CardDataHandler;
