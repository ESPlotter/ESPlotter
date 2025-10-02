export interface ExposedVersions {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  ping: () => Promise<string>;
}

export interface Preload {
  versions: ExposedVersions;
}

declare global {
  interface Window {
    versions: ExposedVersions;
  }

  const versions: ExposedVersions;
}

export {};
