import { useEffect, useState } from 'react';

import { Chart } from '@renderer/components/Chart/Chart';
import { ChartSerie } from '@renderer/components/Chart/ChartSerie';
import { mapAllowedFileStructure } from '@renderer/components/Chart/mapAllowedFileStructure';
import Layout from '@renderer/components/Layout/layout';

export function HomePage() {
  const [series, setSeries] = useState<ChartSerie[]>([]);

  useEffect(() => {
    const offLast = window.files.onLastOpenedFileChanged((file) => {
      setSeries(mapAllowedFileStructure(file.content));
    });

    (async () => {
      const file = await window.files.getLastOpenedFile();
      if (file) {
        setSeries(mapAllowedFileStructure(file.content));
      }
    })();

    return () => {
      offLast();
    };
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold underline">Hello from React!</h1>
        <p>
          This app is using Chrome (v{window.versions.chrome()}), Node.js (v{window.versions.node()}
          ), and Electron (v{window.versions.electron()})
        </p>

        {series.length > 0 && <Chart series={series} />}
      </div>
    </Layout>
  );
}
