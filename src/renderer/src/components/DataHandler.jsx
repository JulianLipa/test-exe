import CardDataHandler from "./CardDataHandler/CardDataHandler";
import styles from "./CardDataHandler/CardDataHandler.module.css";

const DataHandler = ({ src }) => {
  return (
    <div className={`${styles.wrapper}`}>
      <div className={`flex gap-5 ${styles.container}`}>
        {src?.map((item, index) => (
          <CardDataHandler key={index} data={item} />
        ))}
        <div className={`flex items-center justify-end ${styles.fadeRight}`}>
          <button>7</button>
        </div>
      </div>
    </div>
  );
};

export default DataHandler;
