import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function usePrint() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (!content) return;
    const timer = setTimeout(() => {
      window.print();
      setContent(null);
    }, 300);
    return () => clearTimeout(timer);
  }, [content]);

  const triggerPrint = useCallback((node) => setContent(node), []);

  const portal = content
    ? createPortal(
        <div className="print-wrapper print-wrapper--active">{content}</div>,
        document.body
      )
    : null;

  return { triggerPrint, portal };
}
