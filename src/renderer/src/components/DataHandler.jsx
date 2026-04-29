import { useEffect, useState } from "react";
import CardDataHandler from "./CardDataHandler/CardDataHandler";
import styles from "./CardDataHandler/CardDataHandler.module.css";

const DataHandler = () => {
  const [data, setData] = useState([]);

  const ordenar = (arr) =>
    [...arr].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

  useEffect(() => {
    // 🔹 CARGA INICIAL
    const loadInitial = async () => {
      const db = await window.store.loadDB();
      const recibos = await window.store.getRecibos();

      const merged = [
        ...(db || []).map((i) => ({ ...i, type: "alquiler" })),
        ...(recibos || []).map((i) => ({ ...i, type: "recibo" })),
      ];

      setData(ordenar(merged));
    };

    loadInitial();

    // 🔹 WATCH REALTIME (FIXED)
    const unsubscribe = window.store.onDBUpdate((payload) => {
      setData((prev) => {
        const ids = new Set(prev.map((p) => p.id));

        // 👉 detectar SOLO nuevos
        const nuevos = (payload.data || []).filter((item) => !ids.has(item.id));

        if (nuevos.length === 0) return prev;

        const conTipo = nuevos.map((i) => ({
          ...i,
          type: payload.file === "data.json" ? "alquiler" : "recibo",
        }));

        const updated = [...conTipo, ...prev];

        return ordenar(updated);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={`flex gap-5 ${styles.container}`}>
        {data.map((item) => (
          <CardDataHandler key={item.id} data={item} />
        ))}

        <div className={`flex items-center justify-end ${styles.fadeRight}`}>
          <button>7</button>
        </div>
      </div>
    </div>
  );
};

export default DataHandler;
