export interface RendererExposureMap {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
    ping: () => Promise<string>;
  };
}

export interface IpcChannelMap {
  ping: () => string;
}

export type RendererExposureKey = keyof RendererExposureMap;
export type RendererExposure<TName extends RendererExposureKey> = RendererExposureMap[TName];

export type IpcChannelKey = keyof IpcChannelMap;
export type IpcInvokeArgs<TKey extends IpcChannelKey> = Parameters<IpcChannelMap[TKey]>;
export type IpcInvokeResult<TKey extends IpcChannelKey> = Promise<ReturnType<IpcChannelMap[TKey]>>;
export type IpcInvokeHandler<TKey extends IpcChannelKey> = (
  ...args: IpcInvokeArgs<TKey>
) => IpcInvokeResult<TKey>;
