import { contextBridge } from 'electron';
import type { RendererExposure, RendererExposureKey } from '@shared/ipc/contracts';

export function contextBridgeExposeInMainWorld<TName extends RendererExposureKey>(
  key: TName,
  api: RendererExposure<TName>,
) {
  contextBridge.exposeInMainWorld(key, api);
}
