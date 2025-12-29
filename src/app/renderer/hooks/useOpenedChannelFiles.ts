import { useEffect } from 'react';

import { useChannelFiles, useChannelFilesActions } from '@renderer/store/ChannelFilesStore';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export function useOpenedChannelFiles(): ChannelFilePrimitive[] {
  const files = useChannelFiles();
  const { addFile } = useChannelFilesActions();

  useEffect(() => {
    const off = window.files.onChannelFileOpened((file) => {
      addFile(file);
    });

    return () => {
      off();
    };
  }, [addFile]);

  return files;
}
