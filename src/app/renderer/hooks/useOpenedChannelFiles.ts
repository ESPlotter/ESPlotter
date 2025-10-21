import { useEffect, useState } from 'react';

import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export function useOpenedChannelFiles(): ChannelFilePrimitive[] {
  const [data, setData] = useState<ChannelFilePrimitive[]>([]);

  useEffect(() => {
    const offLast = window.files.onLastOpenedChannelFileChanged((file) => {
      setData((prev) => {
        const remaining = prev.filter((item) => item.path !== file.path);
        return [file, ...remaining];
      });
    });

    void loadOpenedChannelFiles();

    return () => {
      offLast();
    };

    async function loadOpenedChannelFiles() {
      const files = await window.files.getOpenedChannelFiles();
      setData(files);
    }
  }, []);

  return data;
}
