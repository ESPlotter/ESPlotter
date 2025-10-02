export interface ExposedVersions {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  ping: () => Promise<string>;
}

declare global {
  interface Window {
    versions: ExposedVersions;
  }

  const versions: ExposedVersions;
}

export {};
