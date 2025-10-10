import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { setMainMenu } from './menu';
import { registerIpcHandlers } from '@main/ipc/registerIpcHandlers';
import { registerAppStateObservers } from '@main/observers/registerAppStateObservers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function shouldQuitForSquirrel(): boolean {
  if (process.platform !== 'win32') {
    return false;
  }

  try {
    const requireForEsm = createRequire(import.meta.url);
    return requireForEsm('electron-squirrel-startup') as boolean;
  } catch {
    return false;
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (shouldQuitForSquirrel()) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Retrieve renderer configuration from environment variables or electron-forge injected variables.
  // Environment variables are used for testing with Playwright.
  const rendererDevServerUrl =
    process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL ?? MAIN_WINDOW_VITE_DEV_SERVER_URL;
  const rendererBundleName = process.env.MAIN_WINDOW_VITE_NAME ?? MAIN_WINDOW_VITE_NAME;

  // and load the index.html of the app.
  if (rendererDevServerUrl) {
    mainWindow.loadURL(rendererDevServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${rendererBundleName}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  registerIpcHandlers();
  registerAppStateObservers();
  setMainMenu();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
