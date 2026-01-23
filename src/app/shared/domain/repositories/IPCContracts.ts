import { ChannelFileOpenStatusPrimitive } from '../primitives/ChannelFileOpenStatusPrimitive';
import { ChannelFilePreviewPrimitive } from '../primitives/ChannelFilePreviewPrimitive';
import { ChannelFileSeriesPrimitive } from '../primitives/ChannelFileSeriesPrimitive';
import { UserPreferencesPrimitive } from '../primitives/UserPreferencesPrimitive';

export interface RendererExposureMap {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
  files: {
    onChannelFileOpenStarted: (
      listener: (payload: ChannelFileOpenStatusPrimitive) => void,
    ) => () => void;
    onChannelFileOpenFailed: (
      listener: (payload: ChannelFileOpenStatusPrimitive) => void,
    ) => () => void;
    onChannelFileOpened: (listener: (file: ChannelFilePreviewPrimitive) => void) => () => void;
    getChannelFileSeries: (path: string, channelId: string) => Promise<ChannelFileSeriesPrimitive>;
    closeChannelFile: (path: string) => Promise<void>;
  };
  userPreferences: {
    getChartSeriesPalette: () => Promise<string[]>;
    updateChartSeriesPalette: (colors: string[]) => Promise<UserPreferencesPrimitive>;
    getDyntoolsPath: () => Promise<string>;
    updateDyntoolsPath: (path: string) => Promise<UserPreferencesPrimitive>;
    selectDyntoolsPath: () => Promise<string | null>;
    getPythonPath: () => Promise<string>;
    updatePythonPath: (path: string) => Promise<UserPreferencesPrimitive>;
    selectPythonPath: () => Promise<string | null>;
    onChangedChartSeriesPalette: (listener: (colors: string[]) => void) => () => void;
    onChangedDyntoolsPath: (listener: (path: string) => void) => () => void;
    onChangedPythonPath: (listener: (path: string) => void) => () => void;
    onOpenRequested: (listener: () => void) => () => void;
  };
  clipboard: {
    writeImage: (dataUrl: string) => Promise<void>;
  };
}

export interface IpcChannelMap {
  ping: () => string;
  getChartSeriesPalette: () => Promise<string[]>;
  updateChartSeriesPalette: (colors: string[]) => Promise<UserPreferencesPrimitive>;
  writeClipboardImage: (dataUrl: string) => Promise<void>;
  getChannelFileSeries: (path: string, channelId: string) => Promise<ChannelFileSeriesPrimitive>;
  closeChannelFile: (path: string) => Promise<void>;
  getDyntoolsPath: () => Promise<string>;
  updateDyntoolsPath: (path: string) => Promise<UserPreferencesPrimitive>;
  selectDyntoolsPath: () => Promise<string | null>;
  getPythonPath: () => Promise<string>;
  updatePythonPath: (path: string) => Promise<UserPreferencesPrimitive>;
  selectPythonPath: () => Promise<string | null>;
}

export interface IpcEventMap {
  channelFileOpenStarted: (payload: ChannelFileOpenStatusPrimitive) => void;
  channelFileOpenFailed: (payload: ChannelFileOpenStatusPrimitive) => void;
  channelFileOpened: (payload: ChannelFilePreviewPrimitive) => void;
  chartSeriesPaletteChanged: (payload: string[]) => void;
  dyntoolsPathChanged: (payload: string) => void;
  pythonPathChanged: (payload: string) => void;
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
