import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.ico";
import { readFileSync, existsSync } from "fs";
import fs from "fs/promises"; // 🔥 nuevo

function inicializarDB() {
  const dbPath = join(app.getPath("desktop"), "db", "data.json");

  if (!existsSync(dbPath)) {
    console.log("No se encontró el archivo en:", dbPath);
  } else {
    const data = JSON.parse(readFileSync(dbPath, "utf-8"));
  }
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
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => console.log("pong"));

  // LEER DB
  ipcMain.handle("db:leer", () => {
    const dbPath = join(app.getPath("desktop"), "db", "data.json");
    const data = JSON.parse(readFileSync(dbPath, "utf-8"));
    return data;
  });

  // GUARDAR DB
  ipcMain.handle("db:agregar", async (event, nuevoDato) => {
    try {
      const dbPath = join(app.getPath("desktop"), "db", "data.json");

      let data = [];
      if (existsSync(dbPath)) {
        const raw = readFileSync(dbPath, "utf-8");
        data = JSON.parse(raw);
      }

      data.push(nuevoDato);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

      return { ok: true };
    } catch (error) {
      console.error("Error agregando dato:", error);
      return { ok: false };
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
