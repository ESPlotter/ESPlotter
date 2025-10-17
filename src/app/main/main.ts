import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { registerMainIpcHandlers } from '@main/shared/ipc/registerMainIpcHandlers';
import { registerMainMenu } from '@main/shared/menu/registerMainMenu';
import { registerChannelFileObservers } from '@main/channel-file/infrastructure/observers/registerChannelFileObservers';

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
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.webContents.toggleDevTools();
      }
    });
  }

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
};

app.whenReady().then(() => {
  registerMainIpcHandlers();
  registerChannelFileObservers();
  registerMainMenu();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
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
