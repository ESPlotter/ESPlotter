import { registerChannelFileIpcHandlers } from '@main/channel-file/infrastructure/ipc/registerChannelFileIpcHandlers';
import { registerClipboardIpcHandlers } from '@main/shared/infrastructure/ipc/registerClipboardIpcHandlers';
import { registerUserPreferencesIpcHandlers } from '@main/user-preferences/infrastructure/ipc/registerUserPreferencesIpcHandlers';

export function registerMainIpcHandlers(): void {
  registerChannelFileIpcHandlers();
  registerUserPreferencesIpcHandlers();
  registerClipboardIpcHandlers();
}
