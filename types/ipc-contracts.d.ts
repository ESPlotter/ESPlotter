import { ChartSerie } from '@main/getChartData/ChartSerie';

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
    /** Returns the persisted last opened file path or null */
    getLastOpenedFilePath: () => Promise<string | null>;
    /** Returns both path and content of the last opened file or null */
    getLastOpenedFile: () => Promise<{ path: string; content: string } | null>;
    /** Reads a file by absolute path (utf-8) */
    readFile: (path: string) => Promise<string>;
    /** Subscribe to push updates when the last opened file changes. Returns unsubscribe. */
    onLastOpenedFileChanged: (
      listener: (file: { path: string; content: string }) => void,
    ) => () => void;
  };
}

export interface IpcChannelMap {
  ping: () => string;
  getChartData: () => Promise<ChartSerie[]>;
  saveNewFile: (fileData: { name: string; content: string }) => Promise<void>;
  getLastOpenedFilePath: () => Promise<string | null>;
  getLastOpenedFile: () => Promise<{ path: string; content: string } | null>;
  readFile: (path: string) => Promise<string>;
}

// Typed push-event channels (main → renderer)
export interface IpcEventMap {
  lastOpenedFileChanged: (payload: { path: string; content: string }) => void;
}

export type IpcEventKey = keyof IpcEventMap;
export type IpcEventPayload<TKey extends IpcEventKey> = Parameters<IpcEventMap[TKey]>[0];
export type IpcEventListener<TKey extends IpcEventKey> = (
  payload: IpcEventPayload<TKey>,
) => void;

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
