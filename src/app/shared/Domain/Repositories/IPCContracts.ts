import { ChannelFilePrimitive } from '../Primitives/ChannelFilePrimitive';

export interface RendererExposureMap {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
    ping: () => Promise<string>;
  };
  files: {
    getLastOpenedFile: () => Promise<ChannelFilePrimitive | null>;
    getOpenedChannelFiles: () => Promise<ChannelFilePrimitive[] | null>;
    onLastOpenedFileChanged: (listener: (file: ChannelFilePrimitive) => void) => () => void;
  };
}

export interface IpcChannelMap {
  ping: () => string;
  getLastOpenedFile: () => Promise<ChannelFilePrimitive | null>;
  getOpenedChannelFiles: () => Promise<ChannelFilePrimitive[] | null>;
}

export interface IpcEventMap {
  lastOpenedFileChanged: (payload: ChannelFilePrimitive) => void;
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
