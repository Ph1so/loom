const { app, BrowserWindow, ipcMain, shell, Menu, dialog, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;
const dataPath = path.join(app.getPath("userData"), "loom-data.json");
const widgetConfigPath = path.join(app.getPath("userData"), "widget-config.json");

const THEME_BG = { dark: "#0B0A08", light: "#FDFAF3" };

// Local YYYY-MM-DD (mirrors localISO in src/App.jsx -- avoids UTC drift).
function localISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readSavedTheme() {
  try {
    if (fs.existsSync(dataPath)) {
      const parsed = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      if (parsed?.theme === "light" || parsed?.theme === "dark") return parsed.theme;
    }
  } catch {}
  return "dark";
}

// ── Widget config (separate file, owned entirely by the main process) ──
// Kept out of loom-data.json because the renderer rewrites that blob wholesale
// and would erase any keys it doesn't know about.
const DEFAULT_WIDGET_CONFIG = {
  visible: true,
  layering: "float",        // "float" (always-on-top) | "recede" (coverable)
  launchAtLogin: false,
  hotkey: "Alt+Space",
  theme: "dark",
  bounds: null,             // { x, y, width, height }
};

function readWidgetConfig() {
  try {
    if (fs.existsSync(widgetConfigPath)) {
      const parsed = JSON.parse(fs.readFileSync(widgetConfigPath, "utf8"));
      return { ...DEFAULT_WIDGET_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error("Failed to read widget config:", e);
  }
  return { ...DEFAULT_WIDGET_CONFIG };
}

function writeWidgetConfig(cfg) {
  try {
    fs.writeFileSync(widgetConfigPath, JSON.stringify(cfg, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Failed to write widget config:", e);
    return false;
  }
}

let widgetConfig = { ...DEFAULT_WIDGET_CONFIG };
let mainWindow = null;
let widgetWindow = null;
let boundsSaveTimer = null;

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

// ── IPC: quick capture from the widget ──────────────────────
// The main process is the single writer for widget appends: read the file,
// add one Inbox entry, write it back, then tell every window to refresh.
ipcMain.handle("quick-capture", (event, text) => {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return { ok: false, error: "Empty capture" };
  try {
    let data = null;
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }
    if (!data || !Array.isArray(data.threads)) {
      data = { threads: [], theme: widgetConfig.theme, prefs: {} };
    }
    let inbox = data.threads.find(t => t.id === "inbox");
    if (!inbox) {
      inbox = { id: "inbox", type: "capture", title: "Inbox", special: "inbox", parentId: null, createdAt: "Today", updatedAt: "Today", entries: [] };
      data.threads.unshift(inbox);
    }
    if (!Array.isArray(inbox.entries)) inbox.entries = [];
    const entry = {
      id: Date.now().toString(),
      text: trimmed,
      dateISO: localISO(new Date()),
      date: "Today",
      ts: 0,
      checked: false,
      pinned: false,
      subtype: "entry",
      parentEntryId: null,
    };
    inbox.entries.push(entry);
    inbox.updatedAt = "Today";
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

    // Refresh any open window (main app) so the entry shows up live.
    broadcast("data-changed");
    return { ok: true, inboxCount: inbox.entries.length };
  } catch (e) {
    console.error("Quick capture failed:", e);
    return { ok: false, error: String(e?.message || e) };
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

// ── IPC: widget config ──────────────────────────────────────
ipcMain.handle("get-widget-config", () => widgetConfig);

ipcMain.handle("set-widget-config", (event, patch) => {
  if (patch && typeof patch === "object") {
    widgetConfig = { ...widgetConfig, ...patch };
    writeWidgetConfig(widgetConfig);
    applyWidgetConfig();
  }
  return widgetConfig;
});

ipcMain.handle("hide-widget", () => {
  if (widgetWindow && !widgetWindow.isDestroyed()) widgetWindow.hide();
  return true;
});

// ── Helpers ─────────────────────────────────────────────────
function broadcast(channel, ...args) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, ...args);
  }
}

// Apply layering / visibility / hotkey / login settings to the live widget.
function applyWidgetConfig() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    if (widgetConfig.layering === "float") {
      widgetWindow.setAlwaysOnTop(true, "floating");
    } else {
      widgetWindow.setAlwaysOnTop(false);
    }
    widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    if (widgetConfig.visible && !widgetWindow.isVisible()) widgetWindow.showInactive();
    if (!widgetConfig.visible && widgetWindow.isVisible()) widgetWindow.hide();
  }
  registerHotkey();
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: !!widgetConfig.launchAtLogin, openAsHidden: true });
  }
}

// Bring the widget to the front and focus it for typing.
function summonWidget() {
  if (!widgetWindow || widgetWindow.isDestroyed()) { createWidgetWindow(); return; }
  widgetConfig.visible = true;
  writeWidgetConfig(widgetConfig);
  widgetWindow.show();
  widgetWindow.focus();
}

function registerHotkey() {
  globalShortcut.unregisterAll();
  const accel = widgetConfig.hotkey || DEFAULT_WIDGET_CONFIG.hotkey;
  try {
    globalShortcut.register(accel, () => {
      // Toggle: if it's already up and focused, tuck it away; otherwise summon.
      if (widgetWindow && !widgetWindow.isDestroyed() && widgetWindow.isVisible() && widgetWindow.isFocused()) {
        widgetWindow.hide();
      } else {
        summonWidget();
      }
    });
  } catch (e) {
    console.error("Failed to register hotkey:", accel, e);
  }
}

// ── Widget window ────────────────────────────────────────────
function createWidgetWindow() {
  const saved = widgetConfig.bounds;
  widgetWindow = new BrowserWindow({
    width: saved?.width || 340,
    height: saved?.height || 152,
    x: saved?.x,
    y: saved?.y,
    minWidth: 260,
    minHeight: 120,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: true,
    skipTaskbar: true,
    fullscreenable: false,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Join every Space (incl. over fullscreen apps) from the moment it exists.
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) {
    widgetWindow.loadURL("http://localhost:5173/widget.html");
  } else {
    widgetWindow.loadFile(path.join(__dirname, "../dist/widget.html"));
  }

  widgetWindow.once("ready-to-show", () => {
    applyWidgetConfig();
    if (widgetConfig.visible) {
      widgetWindow.showInactive();
      // Re-assert after showing; macOS can reset collection behavior on show.
      widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
  });

  const persistBounds = () => {
    if (!widgetWindow || widgetWindow.isDestroyed()) return;
    clearTimeout(boundsSaveTimer);
    boundsSaveTimer = setTimeout(() => {
      if (!widgetWindow || widgetWindow.isDestroyed()) return;
      widgetConfig.bounds = widgetWindow.getBounds();
      writeWidgetConfig(widgetConfig);
    }, 400);
  };
  widgetWindow.on("moved", persistBounds);
  widgetWindow.on("resize", persistBounds);

  // Closing the widget just hides it (and remembers that) -- it never quits the app.
  widgetWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      widgetWindow.hide();
      widgetConfig.visible = false;
      writeWidgetConfig(widgetConfig);
    }
  });

  widgetWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ── Main window ──────────────────────────────────────────────
function createWindow() {
  const theme = readSavedTheme();
  mainWindow = new BrowserWindow({
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
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => { mainWindow = null; });

  // Open external links in the default browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
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
  widgetConfig = readWidgetConfig();
  buildMenu();

  // If launched at login (hidden), skip the big window -- just bring up the widget.
  const openedAtLogin = !isDev && app.getLoginItemSettings().wasOpenedAtLogin;
  if (!openedAtLogin) createWindow();
  createWidgetWindow();

  app.on("activate", () => {
    if (mainWindow === null) createWindow();
    else mainWindow.show();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("before-quit", () => {
  app.isQuitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
