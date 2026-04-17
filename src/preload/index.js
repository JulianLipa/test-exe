import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

let state = {
  data: [],
};

const store = {
  // 🔹 obtener estado
  getData: () => state.data,

  // 🔹 cargar DB desde archivo
  loadDB: async () => {
    try {
      const db = await ipcRenderer.invoke("db:leer");
      state.data = db || [];
      return state.data;
    } catch (error) {
      console.error("Error leyendo DB:", error);
      state.data = [];
      return state.data;
    }
  },

  // 🔹 agregar item (sin reescribir todo en React)
  addItem: async (item) => {
    try {
      const res = await ipcRenderer.invoke("db:agregar", item);

      if (res?.ok) {
        state.data.push(item); // actualiza store local
      }

      return res;
    } catch (error) {
      console.error("Error agregando item:", error);
      return { ok: false, error };
    }
  },

  // 🔹 refrescar manual si lo necesitás
  refresh: async () => {
    const db = await ipcRenderer.invoke("db:leer");
    state.data = db || [];
    return state.data;
  },
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("store", store);
  contextBridge.exposeInMainWorld("electron", electronAPI);
} else {
  window.store = store;
  window.electron = electronAPI;
}