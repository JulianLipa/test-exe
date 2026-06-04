// components/DataHandler/DataHandler.jsx

import { useEffect, useState } from "react";

import CardDataHandler from "./CardDataHandler/CardDataHandler";

import styles from "./CardDataHandler/CardDataHandler.module.css";

const DataHandler = () => {
  const [data, setData] = useState([]);

  // =========================
  // HELPERS
  // =========================

  const ordenar = (arr) => {
    return [...arr].sort(
      (a, b) =>
        new Date(b.createdAt || b.fecha || 0) -
        new Date(a.createdAt || a.fecha || 0),
    );
  };

  const getTypeFromFile = (file) => {
    return file === "data.json" ? "alquiler" : "recibo";
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const alquileres = await window.store.loadDB();

        const recibos = await window.store.getRecibos();

        const merged = [
          ...(alquileres || []).map((item) => ({
            ...item,
            type: "alquiler",
          })),

          ...(recibos || []).map((item) => ({
            ...item,
            type: "recibo",
            alquiler: (alquileres || []).find((a) => a.id === item.alquilerId) || null,
          })),
        ];

        setData(ordenar(merged));
      } catch (err) {
        console.error(err);
      }
    };

    loadInitial();

    // =========================
    // REALTIME UPDATES
    // =========================

    const unsubscribe = window.store.onDBUpdate((payload) => {
      setData((prev) => {
        const type = getTypeFromFile(payload.file);

        const existingIds = new Set(
          prev.map((item) => `${item.type}-${item.id}`),
        );

        const nuevos = (payload.data || [])
          .map((item) => ({
            ...item,
            type,
          }))
          .filter((item) => !existingIds.has(`${item.type}-${item.id}`));

        if (!nuevos.length) {
          return prev;
        }

        return ordenar([...nuevos, ...prev]);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={`flex gap-5 ${styles.container}`}>
        {data.map((item, index) => (
          <CardDataHandler
            key={`${item.type}-${item.id ?? item.alquilerId}-${index}`}
            data={item}
          />
        ))}

        <div className={`flex items-center justify-end ${styles.fadeRight}`}>
          <button>7</button>
        </div>
      </div>
    </div>
  );
};

export default DataHandler;
