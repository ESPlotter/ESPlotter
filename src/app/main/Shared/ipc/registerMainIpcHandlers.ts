import { registerChannelFileIpcHandlers } from '@main/ChannelFile/Infrastructure/Ipc/registerChannelFileIpcHandlers';

export function registerMainIpcHandlers(): void {
  registerChannelFileIpcHandlers();
}
