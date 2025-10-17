import { useEffect, useState } from 'react';

import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export function useOpenedChannelFiles(): ChannelFilePrimitive[] {
  const [data, setData] = useState<ChannelFilePrimitive[]>([]);

  useEffect(() => {
    const offLast = window.files.onLastOpenedChannelFileChanged((file) => {
      setData((prev) => [...prev, file]);
    });

    getOpenedChannelFiles();

    return () => {
      offLast();
    };

    async function getOpenedChannelFiles() {
      const file = await window.files.getOpenedChannelFiles();
      if (file) {
        setData(file);
      }
    }
  }, []);

  return data;
}
