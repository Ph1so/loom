const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("loomAPI", {
  loadData: () => ipcRenderer.invoke("load-data"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  exportData: () => ipcRenderer.invoke("export-data"),
  exportMarkdown: (markdown) => ipcRenderer.invoke("export-markdown", markdown),
  revealDataFile: () => ipcRenderer.invoke("reveal-data-file"),
  getDataPath: () => ipcRenderer.invoke("get-data-path"),
});
