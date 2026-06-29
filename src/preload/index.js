import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

let state = {
  data: [],
};

const store = {
  // =========================
  // DB GENERAL
  // =========================

  getData: () => state.data,

  loadDB: async () => {
    try {
      const db = await ipcRenderer.invoke("db:leer");
      state.data = db || [];
      return state.data;
    } catch {
      state.data = [];
      return [];
    }
  },

  addItem: async (item) => {
    const res = await ipcRenderer.invoke("db:agregar", item);
    if (res?.ok) state.data.push(item);
    return res;
  },

  updateItem: async (item) => {
    const res = await ipcRenderer.invoke("db:actualizar", item);
    if (res?.ok) {
      const idx = state.data.findIndex((d) => String(d.id) === String(item.id));
      if (idx !== -1) state.data[idx] = { ...state.data[idx], ...item };
    }
    return res;
  },

  updateMonto: (alquilerId, numero, monto) =>
    ipcRenderer.invoke("db:actualizarMonto", { alquilerId, numero, monto }),

  refresh: async () => {
    const db = await ipcRenderer.invoke("db:leer");
    state.data = db || [];
    return state.data;
  },

  // =========================
  // 🧾 RECIBOS
  // =========================

  addRecibo: (recibo) => ipcRenderer.invoke("recibos:agregar", recibo),
  getRecibos: () => ipcRenderer.invoke("recibos:leer"),
  searchRecibosPorContrato: (query) => ipcRenderer.invoke("recibos:buscarPorContrato", query),
  deleteRecibo: (recibo) => ipcRenderer.invoke("recibos:eliminar", recibo),

  // =========================
  // 🧾 IMPUESTOS
  // =========================

  addImpuesto: (impuesto) => ipcRenderer.invoke("impuestos:agregar", impuesto),
  getImpuestos: () => ipcRenderer.invoke("impuestos:leer"),
  searchImpuestosPorContrato: (query) => ipcRenderer.invoke("impuestos:buscarPorContrato", query),
  deleteImpuesto: (impuesto) => ipcRenderer.invoke("impuestos:eliminar", impuesto),

  // =========================
  // 🌸 PAPEL ROSA
  // =========================

  addPapelRosa: (item) => ipcRenderer.invoke("papel-rosa:agregar", item),
  getPapelRosa: () => ipcRenderer.invoke("papel-rosa:leer"),
  searchPapelRosaPorContrato: (query) => ipcRenderer.invoke("papel-rosa:buscarPorContrato", query),

  // =========================
  // 🔍 BÚSQUEDA POR CONTRATO
  // =========================

  filtrarAlquileresPorId: (query) => ipcRenderer.invoke("db:filtrarPorId", query),

  // =========================
  // 👀 WATCH DB (NUEVO)
  // =========================

  onDBUpdate: (callback) => {
    const listener = (_, payload) => callback(payload);

    ipcRenderer.on("db:update", listener);

    // 🔥 opcional: devolver función para desuscribirse
    return () => {
      ipcRenderer.removeListener("db:update", listener);
    };
  },
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("store", store);
  contextBridge.exposeInMainWorld("electron", electronAPI);
} else {
  window.store = store;
  window.electron = electronAPI;
}
