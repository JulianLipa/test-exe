import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.ico";
import { readFileSync, existsSync, watch } from "fs"; // 👈 agregamos watch
import fs from "fs/promises";

function inicializarDB() {
  const dbPath = join(app.getPath("desktop"), "db", "data.json");

  if (!existsSync(dbPath)) {
    console.log("No se encontró el archivo en:", dbPath);
  } else {
    const data = JSON.parse(readFileSync(dbPath, "utf-8"));
  }
}

// =========================
// 👀 WATCH DB (NUEVO)
// =========================
function watchDB(win) {
  const dbDir = join(app.getPath("desktop"), "db");

  if (!existsSync(dbDir)) return;

  watch(dbDir, (eventType, filename) => {
    if (!filename) return;

    const fullPath = join(dbDir, filename);

    try {
      if (!existsSync(fullPath)) return;

      const raw = readFileSync(fullPath, "utf-8");
      const data = JSON.parse(raw || "[]");

      // 🔥 enviamos al frontend
      win.webContents.send("db:update", {
        file: filename,
        data,
      });
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

  // 👇 ACTIVAMOS EL WATCHER
  watchDB(mainWindow);
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => console.log("pong"));

  // =========================
  // DB GENERAL
  // =========================

  ipcMain.handle("db:leer", () => {
    const dbPath = join(app.getPath("desktop"), "db", "data.json");
    const data = JSON.parse(readFileSync(dbPath, "utf-8"));
    return data;
  });

  ipcMain.handle("db:agregar", async (event, nuevoDato) => {
    try {
      const dbPath = join(app.getPath("desktop"), "db", "data.json");

      let data = [];
      if (existsSync(dbPath)) {
        const raw = readFileSync(dbPath, "utf-8");
        data = JSON.parse(raw);
      }

      const nuevo = {
        createdAt: new Date().toISOString(),
        ...nuevoDato,
      };

      data.push(nuevo);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

      return { ok: true };
    } catch (error) {
      console.error("Error agregando dato:", error);
      return { ok: false };
    }
  });

  ipcMain.handle("db:actualizar", async (event, itemActualizado) => {
    try {
      const dbPath = join(app.getPath("desktop"), "db", "data.json");
      if (!existsSync(dbPath)) return { ok: false, error: "DB no encontrada" };

      const data = JSON.parse(readFileSync(dbPath, "utf-8"));
      const index = data.findIndex(
        (item) => String(item.id) === String(itemActualizado.id),
      );
      if (index === -1) return { ok: false, error: "Alquiler no encontrado" };

      data[index] = { ...data[index], ...itemActualizado };
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

      return { ok: true };
    } catch (error) {
      console.error("Error actualizando dato:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("db:actualizarMonto", async (event, { alquilerId, numero, monto }) => {
    try {
      const dbPath = join(app.getPath("desktop"), "db", "data.json");
      if (!existsSync(dbPath)) return { ok: false, error: "DB no encontrada" };

      const data = JSON.parse(readFileSync(dbPath, "utf-8"));
      const item = data.find((e) => String(e.id) === String(alquilerId));
      if (!item || !Array.isArray(item.montos)) {
        return { ok: false, error: "Alquiler no encontrado" };
      }

      const montoItem = item.montos.find((m) => Number(m.numero) === Number(numero));
      if (!montoItem) return { ok: false, error: "Monto no encontrado" };

      montoItem.monto = monto;
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

      return { ok: true };
    } catch (error) {
      console.error("Error actualizando monto:", error);
      return { ok: false, error: error.message };
    }
  });

  // =========================
  // 🧾 RECIBOS
  // =========================

  ipcMain.handle("recibos:agregar", async (_, nuevoRecibo) => {
    try {
      const dbDir = join(app.getPath("desktop"), "db");
      const filePath = join(dbDir, "recibos-alq.json");

      if (!existsSync(dbDir)) {
        await fs.mkdir(dbDir, { recursive: true });
      }

      let data = [];

      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, "utf-8");
        data = JSON.parse(raw || "[]");
      } else {
        await fs.writeFile(filePath, "[]");
      }

      const nuevo = {
        createdAt: new Date().toISOString(),
        ...nuevoRecibo,
      };

      data.push(nuevo);

      await fs.writeFile(filePath, JSON.stringify(data, null, 2));

      return { ok: true };
    } catch (error) {
      console.error("Error guardando recibo:", error);
      return { ok: false, error: error.message };
    }
  });

  // =========================
  // 🧾 IMPUESTOS
  // =========================

  ipcMain.handle("impuestos:agregar", async (_, nuevoImpuesto) => {
    try {
      const dbDir = join(app.getPath("desktop"), "db");
      const filePath = join(dbDir, "impuestos.json");

      if (!existsSync(dbDir)) {
        await fs.mkdir(dbDir, { recursive: true });
      }

      let data = [];
      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, "utf-8");
        data = JSON.parse(raw || "[]");
      } else {
        await fs.writeFile(filePath, "[]");
      }

      const nuevo = { createdAt: new Date().toISOString(), ...nuevoImpuesto };
      data.push(nuevo);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error guardando impuesto:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("impuestos:leer", async () => {
    try {
      const filePath = join(app.getPath("desktop"), "db", "impuestos.json");
      if (!existsSync(filePath)) return [];
      return JSON.parse(readFileSync(filePath, "utf-8") || "[]");
    } catch (error) {
      console.error("Error leyendo impuestos:", error);
      return [];
    }
  });

  // =========================
  // 🌸 PAPEL ROSA
  // =========================

  ipcMain.handle("papel-rosa:agregar", async (_, nuevo) => {
    try {
      const dbDir = join(app.getPath("desktop"), "db");
      const filePath = join(dbDir, "papeles-rosa.json");
      if (!existsSync(dbDir)) await fs.mkdir(dbDir, { recursive: true });
      let data = [];
      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, "utf-8");
        data = JSON.parse(raw || "[]");
      } else {
        await fs.writeFile(filePath, "[]");
      }
      data.push({ createdAt: new Date().toISOString(), ...nuevo });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return { ok: true };
    } catch (error) {
      console.error("Error guardando papel rosa:", error);
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("papel-rosa:leer", async () => {
    try {
      const filePath = join(app.getPath("desktop"), "db", "papeles-rosa.json");
      if (!existsSync(filePath)) return [];
      return JSON.parse(readFileSync(filePath, "utf-8") || "[]");
    } catch (error) {
      console.error("Error leyendo papel rosa:", error);
      return [];
    }
  });

  ipcMain.handle("recibos:leer", async () => {
    try {
      const filePath = join(app.getPath("desktop"), "db", "recibos-alq.json");

      if (!existsSync(filePath)) return [];

      const data = JSON.parse(readFileSync(filePath, "utf-8") || "[]");
      return data;
    } catch (error) {
      console.error("Error leyendo recibos:", error);
      return [];
    }
  });

  inicializarDB();
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
