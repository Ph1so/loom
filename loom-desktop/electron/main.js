const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;
const dataPath = path.join(app.getPath("userData"), "loom-data.json");

const THEME_BG = { dark: "#0B0A08", light: "#FDFAF3" };

function readSavedTheme() {
  try {
    if (fs.existsSync(dataPath)) {
      const parsed = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      if (parsed?.theme === "light" || parsed?.theme === "dark") return parsed.theme;
    }
  } catch {}
  return "dark";
}

// ── IPC: load and save thread data ──────────────────────────
ipcMain.handle("load-data", () => {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }
  return null;
});

ipcMain.handle("save-data", (event, data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Failed to save data:", e);
    return false;
  }
});

ipcMain.handle("export-data", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const stamp = new Date().toISOString().slice(0, 10);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Export Loom data",
    defaultPath: `loom-backup-${stamp}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try {
    fs.copyFileSync(dataPath, filePath);
    return { ok: true, path: filePath };
  } catch (e) {
    console.error("Failed to export data:", e);
    return { ok: false, error: String(e?.message || e) };
  }
});

ipcMain.handle("export-markdown", async (event, markdown) => {
  if (typeof markdown !== "string" || markdown.length === 0) {
    return { ok: false, error: "Empty export" };
  }
  const win = BrowserWindow.fromWebContents(event.sender);
  const stamp = new Date().toISOString().slice(0, 10);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Export Loom for LLM",
    defaultPath: `loom-context-${stamp}.md`,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try {
    fs.writeFileSync(filePath, markdown, "utf8");
    return { ok: true, path: filePath };
  } catch (e) {
    console.error("Failed to write markdown export:", e);
    return { ok: false, error: String(e?.message || e) };
  }
});

ipcMain.handle("reveal-data-file", () => {
  try {
    shell.showItemInFolder(dataPath);
    return true;
  } catch (e) {
    console.error("Failed to reveal data file:", e);
    return false;
  }
});

ipcMain.handle("get-data-path", () => dataPath);

// ── Window ───────────────────────────────────────────────────
function createWindow() {
  const theme = readSavedTheme();
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 860,
    minHeight: 540,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 18, y: 22 },
    backgroundColor: THEME_BG[theme],
    vibrancy: null,
    icon: path.join(__dirname, "../assets/icon.icns"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Open external links in the default browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ── App menu (minimal, Mac-native) ───────────────────────────
function buildMenu() {
  const template = [
    {
      label: "Loom",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        isDev ? { role: "toggleDevTools" } : null,
        { role: "reload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ].filter(Boolean),
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Lifecycle ────────────────────────────────────────────────
app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
