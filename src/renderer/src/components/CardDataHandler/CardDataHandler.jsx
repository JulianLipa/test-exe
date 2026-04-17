import styles from "./CardDataHandler.module.css";

const CardDataHandler = ({ data }) => {
  return (
    <div className={`montserrat ${styles.card}`}>
      <p>{data?.id}</p>
      <p className="thin">
        {data?.locador?.apellido} - {data?.locatario?.apellido}
      </p>
    </div>
  );
};

export default CardDataHandler;
