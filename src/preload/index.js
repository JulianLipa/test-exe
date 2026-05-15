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

  refresh: async () => {
    const db = await ipcRenderer.invoke("db:leer");
    state.data = db || [];
    return state.data;
  },

  searchByApellidoLocatario: async (apellidoBuscado) => {
    try {
      const db = await ipcRenderer.invoke("db:leer");

      if (!Array.isArray(db)) return [];

      return db.filter((item) => {
        const apellido = item?.locatario?.apellido || "";

        return apellido
          .toLowerCase()
          .trim()
          .includes(apellidoBuscado.toLowerCase().trim());
      });
    } catch (err) {
      console.error("ERROR SEARCH:", err);
      return [];
    }
  },

  // =========================
  // 🧾 RECIBOS
  // =========================

  addRecibo: (recibo) => ipcRenderer.invoke("recibos:agregar", recibo),
  getRecibos: () => ipcRenderer.invoke("recibos:leer"),

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
