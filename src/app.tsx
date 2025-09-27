export function App() {
  async function ping() {
    const response = await versions.ping()
    console.log(response)
  }

  return (
    <>
      <h1>Hello from React!</h1>
      <p>This app is using Chrome (v{versions.chrome()}), Node.js (v{versions.node()}), and Electron (v{versions.electron()})</p>
      <button onClick={ping}>ping</button>
    </>
  );
}