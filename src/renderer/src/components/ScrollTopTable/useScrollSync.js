import { useEffect, useRef, useState } from "react";

export function useScrollSync() {
  const topRef  = useRef(null);
  const bodyRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const update = () => setScrollWidth(el.scrollWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  });

  const onTopScroll = () => {
    if (bodyRef.current && topRef.current)
      bodyRef.current.scrollLeft = topRef.current.scrollLeft;
  };

  const onBodyScroll = () => {
    if (topRef.current && bodyRef.current)
      topRef.current.scrollLeft = bodyRef.current.scrollLeft;
  };

  return { topRef, bodyRef, scrollWidth, onTopScroll, onBodyScroll };
}
