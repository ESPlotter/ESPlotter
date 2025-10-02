import { ElectronApplication } from "@playwright/test";
import { _electron as electron } from '@playwright/test';

export async function getElectronAppForE2eTest(): Promise<ElectronApplication> {
  return electron.launch({
        args: ['.'],
        timeout: 10_000,
        env: {
          ...process.env,
          NODE_ENV: 'development',
          ELECTRON_IS_DEV: '1',
          MAIN_WINDOW_VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173',
          MAIN_WINDOW_VITE_NAME: 'main_window',
          ELECTRON_DISABLE_SANDBOX: '1',
          ELECTRON_ENABLE_LOGGING: '1',
          CI: '1',
        }
      })
}
