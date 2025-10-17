import { contextBridge } from 'electron';
import { RendererExposure, RendererExposureKey } from '@shared/Domain/Repositories/IPCContracts';

export function contextBridgeExposeInMainWorld<TName extends RendererExposureKey>(
  key: TName,
  api: RendererExposure<TName>,
) {
  contextBridge.exposeInMainWorld(key, api);
}
