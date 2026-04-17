const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => shell.openExternal(url),
  quitApp: () => ipcRenderer.send('quit-app'),
  getVersion: () => ipcRenderer.sendSync('get-version'),
  setAlwaysOnTop: (val) => ipcRenderer.send('set-always-on-top', val),
});
