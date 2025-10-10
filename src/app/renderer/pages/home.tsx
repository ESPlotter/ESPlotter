import { Button } from '@shadcn/components/ui/button';
import { useEffect, useState } from 'react';

export function HomePage() {
  const [lastFile, setLastFile] = useState<{ path: string; content: string } | null>(null);

  async function ping() {
    const response = await window.versions.ping();
    console.log(response);
  }

  useEffect(() => {
    const offLast = window.files.onLastOpenedFileChanged((file) => {
      setLastFile(file);
    });

    (async () => {
      const file = await window.files.getLastOpenedFile();
      if (file) setLastFile(file);
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

      {lastFile && (
        <div className="mt-4 p-3 border rounded-md">
          <div className="font-medium">Last opened file</div>
          <div className="text-sm text-muted-foreground break-all">{lastFile.path}</div>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm">
            {lastFile.content.slice(0, 1000)}
          </pre>
        </div>
      )}
      {/* <Chart series={data} /> */}
    </div>
  );
}
