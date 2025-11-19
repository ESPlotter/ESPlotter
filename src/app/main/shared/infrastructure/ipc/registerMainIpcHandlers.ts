import { registerChannelFileIpcHandlers } from '@main/channel-file/infrastructure/ipc/registerChannelFileIpcHandlers';

export function registerMainIpcHandlers(): void {
  registerChannelFileIpcHandlers();
}
