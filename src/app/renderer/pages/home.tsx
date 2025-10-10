import { Button } from '@shadcn/components/ui/button';
import { useEffect, useState } from 'react';
import { Chart } from '@renderer/components/Chart/Chart';
import type { ChartSerie } from '@shared/chart/ChartSerie';
import { mapAllowedFileStructure } from '@shared/chart/mapAllowedFileStructure';

export function HomePage() {
  const [series, setSeries] = useState<ChartSerie[]>([]);

  async function ping() {
    const response = await window.versions.ping();
    console.log(response);
  }

  useEffect(() => {
    const offLast = window.files.onLastOpenedFileChanged((file) => {
      setSeries(mapAllowedFileStructure(file.data));
    });

    (async () => {
      const file = await window.files.getLastOpenedFile();
      if (file) {
        setSeries(mapAllowedFileStructure(file.data));
      }
    })();

    return () => {
      offLast();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold underline">Hello from React!</h1>
      <p>
        This app is using Chrome (v{window.versions.chrome()}), Node.js (v{window.versions.node()}),
        and Electron (v{window.versions.electron()})
      </p>
      <Button onClick={ping}>ping</Button>

      {series.length > 0 && <Chart series={series} />}
    </div>
  );
}
