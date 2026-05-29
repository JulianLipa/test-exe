import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

import { store } from "./api";

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("store", store);
  contextBridge.exposeInMainWorld("electron", electronAPI);
} else {
  window.store = store;
  window.electron = electronAPI;
}
