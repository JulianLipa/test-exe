import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useListadoPage(backPath = "/") {
  const navigate = useNavigate();
  const navRef = useRef(navigate);
  const [showVolver, setShowVolver] = useState(false);

  useEffect(() => { navRef.current = navigate; });

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "-") setShowVolver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    navRef,
    showVolver,
    setShowVolver,
    goBack: () => navRef.current(backPath),
  };
}
