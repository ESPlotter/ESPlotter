import { Button } from '@components/Button/Button';

export function App() {
  async function ping() {
    const response = await window.versions.ping();
    console.log(response);
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold underline">Hello from React!</h1>
      <p>
        This app is using Chrome (v{window.versions.chrome()}), Node.js (v{window.versions.node()}),
        and Electron (v{window.versions.electron()})
      </p>
      <Button text="ping" onClick={ping} />
    </div>
  );
}
