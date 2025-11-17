import { ChannelFilePrimitive } from '../primitives/ChannelFilePrimitive';
import { UserPreferencesPrimitive } from '../primitives/UserPreferencesPrimitive';

export interface RendererExposureMap {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
  files: {
    getLastOpenedChannelFile: () => Promise<ChannelFilePrimitive | null>;
    getOpenedChannelFiles: () => Promise<ChannelFilePrimitive[]>;
    onLastOpenedChannelFileChanged: (listener: (file: ChannelFilePrimitive) => void) => () => void;
  };
  userPreferences: {
    getChartSeriesPalette: () => Promise<string[]>;
    updateChartSeriesPalette: (colors: string[]) => Promise<UserPreferencesPrimitive>;
    onChangedChartSeriesPalette: (
      listener: (preferences: UserPreferencesPrimitive) => void,
    ) => () => void;
    onOpenRequested: (listener: () => void) => () => void;
  };
}

export interface IpcChannelMap {
  ping: () => string;
  getLastOpenedChannelFile: () => Promise<ChannelFilePrimitive | null>;
  getOpenedChannelFiles: () => Promise<ChannelFilePrimitive[]>;
  getChartSeriesPalette: () => Promise<string[]>;
  updateChartSeriesPalette: (colors: string[]) => Promise<UserPreferencesPrimitive>;
}

export interface IpcEventMap {
  lastOpenedChannelFileChanged: (payload: ChannelFilePrimitive) => void;
  userPreferencesChanged: (payload: UserPreferencesPrimitive) => void;
  userPreferencesOpenRequested: () => void;
}

export type IpcEventKey = keyof IpcEventMap;
export type IpcEventPayload<TKey extends IpcEventKey> = IpcEventMap[TKey] extends () => void
  ? void
  : Parameters<IpcEventMap[TKey]>[0];
export type IpcEventListener<TKey extends IpcEventKey> = IpcEventMap[TKey] extends () => void
  ? () => void
  : (payload: IpcEventPayload<TKey>) => void;

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
