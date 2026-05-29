import { ipcRenderer } from "electron";

// =========================
// 🧾 RECIBOS
// =========================

export const addRecibo = (recibo) => ipcRenderer.invoke("recibos:agregar", recibo);

export const getRecibos = () => ipcRenderer.invoke("recibos:leer");
