import { useEffect } from 'react';

import {
  useChannelFiles,
  useChannelFilesActions,
  type OpenedChannelFile,
} from '@renderer/store/ChannelFilesStore';

export function useOpenedChannelFiles(): OpenedChannelFile[] {
  const files = useChannelFiles();
  const { addFile, startFileOpen, markFileOpenFailed } = useChannelFilesActions();

  useEffect(() => {
    const offOpenStarted = window.files.onChannelFileOpenStarted((payload) => {
      startFileOpen(payload.path);
    });
    const offOpenFailed = window.files.onChannelFileOpenFailed((payload) => {
      markFileOpenFailed(payload.path);
    });
    const offOpenCompleted = window.files.onChannelFileOpened((file) => {
      addFile(file);
    });

    return () => {
      offOpenStarted();
      offOpenFailed();
      offOpenCompleted();
    };
  }, [addFile, markFileOpenFailed, startFileOpen]);

  return files;
}
