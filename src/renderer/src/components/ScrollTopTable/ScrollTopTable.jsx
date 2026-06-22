import { useEffect, useRef, useState } from "react";
import styles from "./ScrollTopTable.module.css";

export default function ScrollTopTable({ children }) {
  const topRef    = useRef(null);
  const bottomRef = useRef(null);
  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const update = () => setInnerWidth(el.scrollWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  const onTopScroll = () => {
    if (bottomRef.current) bottomRef.current.scrollLeft = topRef.current.scrollLeft;
  };

  const onBottomScroll = () => {
    if (topRef.current) topRef.current.scrollLeft = bottomRef.current.scrollLeft;
  };

  return (
    <div className={styles.wrapper}>
      <div ref={topRef} onScroll={onTopScroll} className={styles.topScroll}>
        <div style={{ width: innerWidth, height: 1 }} />
      </div>
      <div ref={bottomRef} onScroll={onBottomScroll} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
