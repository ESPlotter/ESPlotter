export function App() {
  async function ping() {
    const response = await versions.ping()
    console.log(response)
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold underline">Hello from React test CI!</h1>
      <p>This app is using Chrome (v{versions.chrome()}), Node.js (v{versions.node()}), and Electron (v{versions.electron()})</p>
      <button className="rounded-md bg-blue-600 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg active:bg-blue-700 hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" onClick={ping}>ping</button>
    </div>
  );
}