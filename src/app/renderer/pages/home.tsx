import { Button } from '@shadcn/components/ui/button';
import { Chart, ChartSerie } from '@renderer/components/Chart/Chart';
import { useEffect, useState } from 'react';

export function HomePage() {
  const [data, setData] = useState<ChartSerie[]>([]);
  const [lastFile, setLastFile] = useState<{ path: string; content: string } | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function ping() {
    const response = await window.versions.ping();
    console.log(response);
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await window.uniplot.getChartData();
      setData(response);
    };

    fetchData();
    // Subscriptions
    const offLast = window.files.onLastOpenedFileChanged((file) => {
      setLastFile(file);
    });
    const offRecents = window.files.onRecentFilesChanged((paths) => {
      setRecents(paths);
    });
    const offFailed = window.files.onFileOpenFailed(({ path, reason }) => {
      const msg =
        reason === 'not_found'
          ? `File not found: ${path}`
          : `Cannot open file: ${path}`;
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    });

    (async () => {
      const file = await window.files.getLastOpenedFile();
      if (file) setLastFile(file);
      const recent = await window.files.getRecentFiles();
      setRecents(recent);
    })();

    return () => {
      offLast();
      offRecents();
      offFailed();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold underline">Hello from React!</h1>
      {errorMsg && (
        <div className="mt-2 p-2 border border-red-300 bg-red-50 text-red-700 rounded">
          {errorMsg}
        </div>
      )}
      <p>
        This app is using Chrome (v{window.versions.chrome()}), Node.js (v{window.versions.node()}),
        and Electron (v{window.versions.electron()})
      </p>
      <Button onClick={ping}>ping</Button>
      {recents.length > 0 && (
        <div className="mt-4 p-3 border rounded-md">
          <div className="font-medium mb-2">Recent files</div>
          <ul className="space-y-1">
            {recents.map((p) => (
              <li key={p} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground break-all">{p}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.files.openByPath(p)}
                >
                  Open
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {lastFile && (
        <div className="mt-4 p-3 border rounded-md">
          <div className="font-medium">Last opened file</div>
          <div className="text-sm text-muted-foreground break-all">{lastFile.path}</div>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm">
            {lastFile.content.slice(0, 1000)}
          </pre>
        </div>
      )}
      <Chart series={data} />
    </div>
  );
}
