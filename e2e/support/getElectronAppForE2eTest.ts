import { ElectronApplication, _electron as electron } from '@playwright/test';

interface ElectronLaunchEnv {
  [key: string]: string;
}

export async function getElectronAppForE2eTest(): Promise<ElectronApplication> {
  const isPackaged = Boolean(process.env.ESPLOTTER_E2E_PACKAGED);

  if (isPackaged) {
    return electron.launch({
      executablePath: getPackagedAppPath(),
      timeout: 20_000,
      env: getElectronLaunchEnv(true),
      args: ['--remote-debugging-port=0', '--disable-gpu', '--disable-auto-update'],
    });
  }

  return electron.launch({
    args: ['.'],
    timeout: 10_000,
    env: getElectronLaunchEnv(false),
  });
}

function getPackagedAppPath(): string {
  const appPath = process.env.ESPLOTTER_E2E_APP_PATH;
  if (!appPath) {
    throw new Error('ESPLOTTER_E2E_APP_PATH is required when ESPLOTTER_E2E_PACKAGED is set.');
  }

  return appPath;
}

function getElectronLaunchEnv(isPackaged: boolean): ElectronLaunchEnv {
  const baseEnv = {
    ...process.env,
    ELECTRON_DISABLE_SANDBOX: '1',
    ELECTRON_ENABLE_LOGGING: '1',
    CI: '1',
  } satisfies NodeJS.ProcessEnv;

  if (isPackaged) {
    return normalizeEnv({
      ...baseEnv,
      NODE_ENV: 'production',
    });
  }

  return normalizeEnv({
    ...baseEnv,
    NODE_ENV: 'development',
    ELECTRON_IS_DEV: '1',
    MAIN_WINDOW_VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173',
    MAIN_WINDOW_VITE_NAME: 'main_window',
  });
}

function normalizeEnv(env: NodeJS.ProcessEnv): ElectronLaunchEnv {
  const entries = Object.entries(env)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => [key, value]);

  return Object.fromEntries(entries);
}
