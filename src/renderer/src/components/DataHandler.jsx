import { useEffect, useRef, useState } from "react";
import CardDataHandler from "./CardDataHandler/CardDataHandler";
import styles from "./CardDataHandler/CardDataHandler.module.css";

const DataHandler = () => {
  const [data, setData] = useState([]);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  const ordenar = (arr) =>
    [...arr].sort(
      (a, b) =>
        new Date(b.createdAt || b.fecha || 0) -
        new Date(a.createdAt || a.fecha || 0)
    );

  const getTypeFromFile = (file) => {
    if (file === "data.json")       return "alquiler";
    if (file === "recibos-alq.json") return "recibo";
    if (file === "impuestos.json")  return "impuesto";
    if (file === "papel-rosa.json") return "papelrosa";
    return null;
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const alquileres  = await window.store.loadDB();
        const recibos     = await window.store.getRecibos();
        const impuestos   = await window.store.getImpuestos();
        const papelRosas  = await window.store.getPapelRosa();

        const merged = [
          ...(alquileres || []).map((item) => ({ ...item, type: "alquiler" })),
          ...(recibos    || []).map((item) => ({
            ...item,
            type: "recibo",
            alquiler: (alquileres || []).find((a) => a.id === item.alquilerId) || null,
          })),
          ...(impuestos  || []).map((item) => ({
            ...item,
            type: "impuesto",
            alquiler: (alquileres || []).find((a) => a.id === item.alquilerId) || null,
          })),
          ...(papelRosas || []).map((item) => ({
            ...item,
            type: "papelrosa",
          })),
        ];

        setData(ordenar(merged));
      } catch (err) {
        console.error(err);
      }
    };

    loadInitial();

    const unsubscribe = window.store.onDBUpdate((payload) => {
      setData((prev) => {
        const type = getTypeFromFile(payload.file);
        if (!type) return prev;

        const existingIds = new Set(prev.map((item) => `${item.type}-${item.id}-${item.createdAt}`));

        const nuevos = (payload.data || [])
          .map((item) => ({ ...item, type }))
          .filter((item) => !existingIds.has(`${item.type}-${item.id}-${item.createdAt}`));

        if (!nuevos.length) return prev;
        return ordenar([...nuevos, ...prev]);
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [data]);

  return (
    <div className={styles.wrapper}>

      {canScrollLeft && (
        <div className={styles.arrowLeft}>
          <button onClick={() => scrollBy(-1)} aria-label="Scroll izquierda">‹</button>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex gap-5 ${styles.container}`}
        onScroll={updateScrollState}
      >
        {data.map((item, index) => (
          <CardDataHandler
            key={`${item.type}-${item.alquilerId ?? item.id}-${index}`}
            data={item}
          />
        ))}
      </div>

      {canScrollRight && (
        <div className={styles.arrowRight}>
          <button onClick={() => scrollBy(1)} aria-label="Scroll derecha">›</button>
        </div>
      )}

    </div>
  );
};

export default DataHandler;
