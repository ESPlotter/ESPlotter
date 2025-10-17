import { RendererExposureMap } from '@shared/domain/repositories/IPCContracts';

declare global {
  interface Window extends RendererExposureMap {
    /**
     * Brands the interface so lint rules accept the extension while keeping it structurally typed.
     */
    readonly __ipcExposuresBrand?: never;
  }
}

export {};
