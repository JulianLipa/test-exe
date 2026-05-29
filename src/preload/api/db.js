import { ipcRenderer } from "electron";

import { state } from "../state";

// =========================
// DB GENERAL
// =========================

export const getData = () => state.data;

export const loadDB = async () => {
  try {
    const db = await ipcRenderer.invoke("db:leer");
    state.data = db || [];
    return state.data;
  } catch {
    state.data = [];
    return [];
  }
};

export const addItem = async (item) => {
  const res = await ipcRenderer.invoke("db:agregar", item);
  if (res?.ok) state.data.push(item);
  return res;
};

export const refresh = async () => {
  const db = await ipcRenderer.invoke("db:leer");
  state.data = db || [];
  return state.data;
};

export const searchByApellidoLocatario = async (apellidoBuscado) => {
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
};
