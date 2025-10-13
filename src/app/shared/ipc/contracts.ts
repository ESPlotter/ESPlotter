import type { ChartSerie } from '@shared/chart/ChartSerie';
import type { AllowedFileStructure } from '@shared/AllowedFileStructure';

export type OpenedFile = { path: string; data: AllowedFileStructure };

// Typed objects exposed in the renderer process (via contextBridge)
export interface RendererExposureMap {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
    ping: () => Promise<string>;
  };
  uniplot: {
    getChartData: () => Promise<ChartSerie[]>;
    saveNewFile: (fileData: { name: string; content: string }) => Promise<void>;
  };
  files: {
    getLastOpenedFilesPath: () => Promise<string[] | null>;
    getLastOpenedFile: () => Promise<OpenedFile | null>;
    getLastOpenedFiles: () => Promise<OpenedFile[] | null>
    readFile: (path: string) => Promise<AllowedFileStructure>;
    onFileOpenFailed: (
      listener: (payload: {
        path: string;
        reason: 'not_found' | 'unreadable' | 'invalid_json' | 'invalid_format' | 'unknown';
        message?: string;
      }) => void,
    ) => () => void;
    openByPath: (path: string) => Promise<void>;
    onLastOpenedFileParsedChanged: (listener: (file: OpenedFile) => void) => () => void;
  };
}

// Typed IPC channels (renderer → main)
export interface IpcChannelMap {
  ping: () => string;
  getChartData: () => Promise<ChartSerie[]>;
  saveNewFile: (fileData: { name: string; content: string }) => Promise<void>;
  getLastOpenedFilesPath: () => Promise<string[] | null>;
  getLastOpenedFile: () => Promise<OpenedFile | null>;
  getLastOpenedFiles: () => Promise<OpenedFile[] | null>
  readFile: (path: string) => Promise<AllowedFileStructure>;
  openByPath: (path: string) => Promise<void>;
}

// Typed push-event channels (main → renderer)
export interface IpcEventMap {
  lastOpenedFileParsedChanged: (payload: OpenedFile) => void;
  fileOpenFailed: (payload: {
    path: string;
    reason: 'not_found' | 'unreadable' | 'invalid_json' | 'invalid_format' | 'unknown';
    message?: string;
  }) => void;
}

export type IpcEventKey = keyof IpcEventMap;
export type IpcEventPayload<TKey extends IpcEventKey> = Parameters<IpcEventMap[TKey]>[0];
export type IpcEventListener<TKey extends IpcEventKey> = (payload: IpcEventPayload<TKey>) => void;

export type RendererExposureKey = keyof RendererExposureMap;
export type RendererExposure<TName extends RendererExposureKey> = RendererExposureMap[TName];

export type IpcChannelKey = keyof IpcChannelMap;
export type IpcInvokeArgs<TKey extends IpcChannelKey> = Parameters<IpcChannelMap[TKey]>;
export type IpcInvokeResult<TKey extends IpcChannelKey> = Promise<
  Awaited<ReturnType<IpcChannelMap[TKey]>>
>;

export type IpcInvokeHandlerResult<TKey extends IpcChannelKey> = ReturnType<IpcChannelMap[TKey]>;
export type IpcInvokeHandler<TKey extends IpcChannelKey> = (
  ...args: IpcInvokeArgs<TKey>
) => IpcInvokeHandlerResult<TKey>;
