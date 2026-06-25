import { useEffect, useRef, useState } from "react";
import styles from "./ScrollTopTable.module.css";

export default function ScrollTopTable({ children, vertical }) {
  const topRef     = useRef(null);
  const rightRef   = useRef(null);
  const contentRef = useRef(null);
  const [innerWidth,  setInnerWidth]  = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const update = () => {
      setInnerWidth(el.scrollWidth);
      setInnerHeight(el.scrollHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  const onTopScroll = () => {
    if (contentRef.current) contentRef.current.scrollLeft = topRef.current.scrollLeft;
  };
  const onRightScroll = () => {
    if (contentRef.current) contentRef.current.scrollTop = rightRef.current.scrollTop;
  };
  const onContentScroll = () => {
    if (topRef.current)              topRef.current.scrollLeft  = contentRef.current.scrollLeft;
    if (vertical && rightRef.current) rightRef.current.scrollTop = contentRef.current.scrollTop;
  };

  return (
    <div className={styles.wrapper}>
      <div ref={topRef} onScroll={onTopScroll} className={styles.topScroll}>
        <div style={{ width: innerWidth, height: 1 }} />
      </div>
      <div className={styles.body}>
        <div
          ref={contentRef}
          onScroll={onContentScroll}
          className={styles.content}
        >
          {children}
        </div>
        {vertical && (
          <div ref={rightRef} onScroll={onRightScroll} className={styles.rightScroll}>
            <div style={{ height: innerHeight, width: 1 }} />
          </div>
        )}
      </div>
    </div>
  );
}
