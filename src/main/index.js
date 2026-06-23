import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.ico";
import { existsSync, watch } from "fs";
import fs from "fs/promises";

const dbPath     = () => join(app.getPath("desktop"), "db", "data.json");
const recibosPath  = () => join(app.getPath("desktop"), "db", "recibos-alq.json");
const impuestosPath = () => join(app.getPath("desktop"), "db", "impuestos.json");
const papelRosaPath = () => join(app.getPath("desktop"), "db", "papeles-rosa.json");

async function readJSON(filePath, fallback = []) {
  try {
    if (!existsSync(filePath)) return fallback;
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function watchDB(win) {
  const dbDir = join(app.getPath("desktop"), "db");
  if (!existsSync(dbDir)) return;

  const SEND_FULL = ["data.json", "papeles-rosa.json"];

  watch(dbDir, (eventType, filename) => {
    if (!filename) return;
    const fullPath = join(dbDir, filename);
    try {
      if (!existsSync(fullPath)) return;
      const { readFileSync } = require("fs");
      const raw = readFileSync(fullPath, "utf-8");
      const data = JSON.parse(raw || "[]");

      if (SEND_FULL.includes(filename)) {
        win.webContents.send("db:update", { file: filename, data });
      } else {
        const item = data.length > 0 ? data[data.length - 1] : null;
        win.webContents.send("db:update", { file: filename, item });
      }
    } catch (err) {
      console.error("Error leyendo cambio:", err);
    }
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  watchDB(mainWindow);
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // =========================
  // DB GENERAL
  // =========================

  ipcMain.handle("db:leer", async () => readJSON(dbPath()));

  ipcMain.handle("db:agregar", async (_, nuevoDato) => {
    try {
      const path = dbPath();
      const data = await readJSON(path);
      data.push({ createdAt: new Date().toISOString(), ...nuevoDato });
      await fs.writeFile(path, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error agregando dato:", error);
      return { ok: false };
    }
  });

  ipcMain.handle("db:actualizar", async (_, itemActualizado) => {
    try {
      const path = dbPath();
      const data = await readJSON(path);
      const index = data.findIndex((item) => String(item.id) === String(itemActualizado.id));
      if (index === -1) return { ok: false, error: "Alquiler no encontrado" };
      data[index] = { ...data[index], ...itemActualizado };
      await fs.writeFile(path, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error actualizando dato:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("db:actualizarMonto", async (_, { alquilerId, numero, monto }) => {
    try {
      const path = dbPath();
      const data = await readJSON(path);
      const item = data.find((e) => String(e.id) === String(alquilerId));
      if (!item) return { ok: false, error: "Alquiler no encontrado" };
      if (!Array.isArray(item.montos)) item.montos = [];
      const montoItem = item.montos.find((m) => Number(m.numero) === Number(numero));
      if (montoItem) {
        montoItem.monto = monto;
      } else {
        item.montos.push({ numero: Number(numero), monto });
        item.montos.sort((a, b) => a.numero - b.numero);
      }
      await fs.writeFile(path, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error actualizando monto:", error);
      return { ok: false, error: error.message };
    }
  });

  const norm = (str) =>
    String(str ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const alquilerMatchesQuery = (a, q) => {
    const nq = norm(q);
    if (!nq) return false;
    return [
      a.id,
      a.locador?.apellido,
      a.locador?.nombre,
      a.locatario?.apellido,
      a.locatario?.nombre,
    ].some((f) => norm(f).includes(nq));
  };

  ipcMain.handle("db:filtrarPorId", async (_, query) => {
    const data = await readJSON(dbPath());
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return [];
    return data.filter((a) => alquilerMatchesQuery(a, q));
  });

  // =========================
  // 🧾 RECIBOS
  // =========================

  ipcMain.handle("recibos:leer", async () => readJSON(recibosPath()));

  ipcMain.handle("recibos:agregar", async (_, nuevoRecibo) => {
    try {
      const path = recibosPath();
      const dbDir = join(app.getPath("desktop"), "db");
      if (!existsSync(dbDir)) await fs.mkdir(dbDir, { recursive: true });
      const data = await readJSON(path);
      data.push({ createdAt: new Date().toISOString(), ...nuevoRecibo });
      await fs.writeFile(path, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error guardando recibo:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("recibos:buscarPorContrato", async (_, query) => {
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return [];
    const [recibos, alquileres] = await Promise.all([readJSON(recibosPath()), readJSON(dbPath())]);
    const ids = new Set(alquileres.filter((a) => alquilerMatchesQuery(a, q)).map((a) => String(a.id)));
    return recibos.filter((r) => ids.has(String(r.alquilerId ?? r.id ?? "")));
  });

  // =========================
  // 🧾 IMPUESTOS
  // =========================

  ipcMain.handle("impuestos:leer", async () => readJSON(impuestosPath()));

  ipcMain.handle("impuestos:agregar", async (_, nuevoImpuesto) => {
    try {
      const path = impuestosPath();
      const dbDir = join(app.getPath("desktop"), "db");
      if (!existsSync(dbDir)) await fs.mkdir(dbDir, { recursive: true });
      const data = await readJSON(path);
      data.push({ createdAt: new Date().toISOString(), ...nuevoImpuesto });
      await fs.writeFile(path, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error guardando impuesto:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("impuestos:buscarPorContrato", async (_, query) => {
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return [];
    const [impuestos, alquileres] = await Promise.all([readJSON(impuestosPath()), readJSON(dbPath())]);
    const ids = new Set(alquileres.filter((a) => alquilerMatchesQuery(a, q)).map((a) => String(a.id)));
    return impuestos.filter((i) => ids.has(String(i.alquilerId ?? "")));
  });

  // =========================
  // 🌸 PAPEL ROSA
  // =========================

  ipcMain.handle("papel-rosa:leer", async () => readJSON(papelRosaPath()));

  ipcMain.handle("papel-rosa:agregar", async (_, nuevo) => {
    try {
      const path = papelRosaPath();
      const dbDir = join(app.getPath("desktop"), "db");
      if (!existsSync(dbDir)) await fs.mkdir(dbDir, { recursive: true });
      const data = await readJSON(path);
      data.push({ createdAt: new Date().toISOString(), ...nuevo });
      await fs.writeFile(path, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error guardando papel rosa:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("papel-rosa:buscarPorContrato", async (_, query) => {
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return [];
    const [papelRosa, alquileres] = await Promise.all([readJSON(papelRosaPath()), readJSON(dbPath())]);
    const ids = new Set(alquileres.filter((a) => alquilerMatchesQuery(a, q)).map((a) => String(a.id)));
    return papelRosa.filter((p) => ids.has(String(p.alquilerId ?? "")));
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
