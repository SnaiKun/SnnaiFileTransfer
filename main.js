const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express'); // Optional: If running Express inside Electron
const os = require('os');

ipcMain.handle('get-ip', () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost'; // Fallback
});

// Keep a global reference of the window to avoid garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Allow Node.js in the renderer process
      contextIsolation: false, // Required for direct `require()` in renderer
      enableRemoteModule: true, // If you use `remote` (deprecated in newer Electron)
    }
  });

  // Load your HTML file
  mainWindow.loadFile('index.html');

  // Open DevTools (optional, for debugging)
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron is ready to create windows
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create window on macOS if dock icon is clicked
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Optional: Start Express server inside Electron
ipcMain.on('start-server', () => {
  const expressApp = express();
  expressApp.use(express.static('public'));

  expressApp.listen(3000, () => {
    console.log('Express server running on port 3000');
  });
});