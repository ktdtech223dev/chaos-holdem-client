const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function getSavedSettings() {
  try {
    const cfg = path.join(app.getPath('userData'), 'windowMode.txt');
    if (fs.existsSync(cfg)) {
      const data = JSON.parse(fs.readFileSync(cfg, 'utf8'));
      return data;
    }
  } catch(e) {}
  return { mode: 'fullscreen', alwaysOnTop: false };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'windowMode.txt'),
      JSON.stringify(settings)
    );
  } catch(e) {}
}

function createWindow() {
  const settings = getSavedSettings();
  const mode = settings.mode || 'fullscreen';

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 650,
    title: "Chaos Hold'Em v0.8.0",
    backgroundColor: '#080810',
    autoHideMenuBar: true,
    fullscreen: mode === 'fullscreen',
    frame: mode !== 'borderless',
    alwaysOnTop: settings.alwaysOnTop || false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (mode === 'borderless') mainWindow.maximize();
  if (mode === 'windowed') {
    mainWindow.setSize(1440, 900);
    mainWindow.center();
  }

  mainWindow.loadFile('chaos_holdem.html');
  mainWindow.setMenu(null);

  // IPC handlers — multiple ways to quit
  ipcMain.on('quit-app', () => {
    console.log('[main] quit-app IPC received');
    app.quit();
  });
  ipcMain.on('force-quit', () => {
    console.log('[main] force-quit IPC received');
    app.exit(0);
  });
  ipcMain.on('get-version', (e) => { e.returnValue = app.getVersion(); });
  ipcMain.on('set-always-on-top', (e, val) => {
    mainWindow.setAlwaysOnTop(val);
    const s = getSavedSettings();
    s.alwaysOnTop = val;
    saveSettings(s);
  });

  // Title-based signals
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    if (title === 'CHAOS_EXIT') { app.quit(); return; }
    if (title.startsWith('CHAOS_ALWAYS_ON_TOP:')) {
      const val = title.includes(':on');
      mainWindow.setAlwaysOnTop(val);
      const s = getSavedSettings();
      s.alwaysOnTop = val;
      saveSettings(s);
      return;
    }
    if (title.startsWith('CHAOS_WINDOW_MODE:')) {
      const newMode = title.replace('CHAOS_WINDOW_MODE:', '').trim();
      const s = getSavedSettings();
      s.mode = newMode;
      saveSettings(s);
      if (newMode === 'fullscreen') {
        mainWindow.setFullScreen(true);
      } else if (newMode === 'borderless') {
        mainWindow.setFullScreen(false);
        mainWindow.maximize();
      } else {
        mainWindow.setFullScreen(false);
        mainWindow.setSize(1440, 900);
        mainWindow.center();
      }
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  // Emergency exit shortcuts at the OS level — works even if renderer is frozen
  const { globalShortcut } = require('electron');
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    console.log('[main] Emergency exit shortcut fired');
    app.exit(0);
  });
  globalShortcut.register('CommandOrControl+Q', () => {
    console.log('[main] Ctrl+Q exit shortcut fired');
    if (mainWindow) mainWindow.close();
    setTimeout(() => app.quit(), 500);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  const { globalShortcut } = require('electron');
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
