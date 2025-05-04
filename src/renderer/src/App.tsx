import { useState } from "react";

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions);
  return (
    <ul className="flex flex-row justify-center gap-4 text-sm text-gray-600">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  );
}

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <section className="w-full max-w-2xl space-y-6 rounded-lg bg-white p-8 text-center shadow">
        <h3 className="text-xl font-semibold text-gray-900">
          Powered by <span className="text-indigo-600">electron‑vite</span>
        </h3>

        <p className="text-gray-700">
          Build an Electron app with <span className="font-medium">React</span>
          &nbsp;and <span className="font-medium">TypeScript</span>
        </p>

        <p className="text-sm text-gray-500">
          Press <code>`F12`</code> or <code>`Ctrl+Shift+I`</code> to open the
          dev&nbsp;tools
        </p>

        <Versions />

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="https://electron-vite.org/"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
          >
            Documentation
          </a>

          <button
            type="button"
            onClick={ipcHandle}
            className="cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Send&nbsp;IPC
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
