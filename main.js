const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let stateFilePath;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 200,
    height: 80,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  stateFilePath = path.join(app.getPath('userData'), 'timer_state.json');

  ipcMain.handle('load-state', () => {
    try {
      if (fs.existsSync(stateFilePath)) {
        const data = fs.readFileSync(stateFilePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Failed to load state:', err);
    }
    return null;
  });

  ipcMain.on('save-state', (event, state) => {
    try {
      if (state === null) {
        if (fs.existsSync(stateFilePath)) {
          fs.unlinkSync(stateFilePath);
        }
      } else {
        fs.writeFileSync(stateFilePath, JSON.stringify(state));
      }
    } catch (err) {
      console.error('Failed to save state:', err);
    }
  });
  
  ipcMain.on('close-app', () => {
      app.quit();
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
