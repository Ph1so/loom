const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("loomAPI", {
  loadData: () => ipcRenderer.invoke("load-data"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  exportData: () => ipcRenderer.invoke("export-data"),
  exportMarkdown: (markdown) => ipcRenderer.invoke("export-markdown", markdown),
  revealDataFile: () => ipcRenderer.invoke("reveal-data-file"),
  getDataPath: () => ipcRenderer.invoke("get-data-path"),
  setWindowVibrancy: (enabled) => ipcRenderer.invoke("set-window-vibrancy", enabled),

  // Quick Capture widget
  quickCapture: (text) => ipcRenderer.invoke("quick-capture", text),
  getWidgetConfig: () => ipcRenderer.invoke("get-widget-config"),
  setWidgetConfig: (patch) => ipcRenderer.invoke("set-widget-config", patch),
  hideWidget: () => ipcRenderer.invoke("hide-widget"),

  // Smart sort (LLM). The API key stays in the main process; the renderer only
  // learns whether one is set via `hasKey`.
  getLlmConfig: () => ipcRenderer.invoke("get-llm-config"),
  setLlmConfig: (patch) => ipcRenderer.invoke("set-llm-config", patch),
  getMemoryStatus: () => ipcRenderer.invoke("get-memory-status"),
  suggestSort: (payload) => ipcRenderer.invoke("llm-suggest-sort", payload),
  reviewJournal: (payload) => ipcRenderer.invoke("llm-review-journal", payload),
  buildMemory: (payload) => ipcRenderer.invoke("llm-build-memory", payload),

  // Notifies the renderer when the data file changed underneath it (e.g. a
  // widget capture). Returns an unsubscribe function.
  onDataChanged: (cb) => {
    const handler = () => cb();
    ipcRenderer.on("data-changed", handler);
    return () => ipcRenderer.removeListener("data-changed", handler);
  },
});
