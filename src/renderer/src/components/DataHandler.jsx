import { useEffect, useRef, useState } from "react";
import CardDataHandler from "./CardDataHandler/CardDataHandler";
import styles from "./CardDataHandler/CardDataHandler.module.css";

const DataHandler = () => {
  const [data, setData] = useState([]);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef       = useRef(null);
  const alquileresMapRef = useRef(new Map());

  const ordenar = (arr) =>
    [...arr].sort(
      (a, b) =>
        new Date(b.createdAt || b.fecha || 0) -
        new Date(a.createdAt || a.fecha || 0)
    );

  const getTypeFromFile = (file) => {
    if (file === "data.json")          return "alquiler";
    if (file === "recibos-alq.json")   return "recibo";
    if (file === "impuestos.json")     return "impuesto";
    if (file === "papeles-rosa.json")  return "papelrosa";
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
        const alquileres = await window.store.loadDB();
        const papelRosas = await window.store.getPapelRosa();

        // Map para joins O(1) en onDBUpdate
        alquileresMapRef.current = new Map((alquileres || []).map((a) => [a.id, a]));

        const merged = [
          ...(alquileres || []).map((item) => ({ ...item, type: "alquiler" })),
          ...(papelRosas || []).map((item) => ({ ...item, type: "papelrosa" })),
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

        // Archivos completos (data.json, papeles-rosa.json)
        if (payload.data) {
          if (type === "alquiler") {
            alquileresMapRef.current = new Map(payload.data.map((a) => [a.id, a]));
          }
          const existingIds = new Set(
            prev.map((item) => `${item.type}-${item.id}-${item.createdAt}`)
          );
          const nuevos = payload.data
            .map((item) => ({ ...item, type }))
            .filter((item) => !existingIds.has(`${item.type}-${item.id}-${item.createdAt}`));
          if (!nuevos.length) return prev;
          return ordenar([...nuevos, ...prev]);
        }

        // Item único (recibos-alq.json, impuestos.json)
        if (payload.item) {
          const alquiler = alquileresMapRef.current.get(payload.item.alquilerId) || null;
          return ordenar([{ ...payload.item, type, alquiler }, ...prev]);
        }

        return prev;
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
