import { contextBridge } from 'electron';
import { RendererExposure, RendererExposureKey } from '@shared/domain/repositories/IPCContracts';

export function contextBridgeExposeInMainWorld<TName extends RendererExposureKey>(
  key: TName,
  api: RendererExposure<TName>,
) {
  contextBridge.exposeInMainWorld(key, api);
}
