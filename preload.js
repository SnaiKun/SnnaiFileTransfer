const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getIP: () => ipcRenderer.invoke('get-ip')
});