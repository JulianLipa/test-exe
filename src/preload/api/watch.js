import { ipcRenderer } from "electron";

// =========================
// 👀 WATCH DB
// =========================

export const onDBUpdate = (callback) => {
  const listener = (_, payload) => callback(payload);

  ipcRenderer.on("db:update", listener);

  // Devuelve una función para desuscribirse.
  return () => {
    ipcRenderer.removeListener("db:update", listener);
  };
};
