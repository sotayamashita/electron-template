import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { IconBrandReact, IconBrandTypescript } from "@tabler/icons-react";
import { useState } from "react";

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions);
  return (
    <ul className="flex flex-row justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  );
}

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <section className="w-full max-w-2xl space-y-6 rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Powered by{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            electron‑vite
          </span>
        </h3>

        <p className="text-gray-700 dark:text-gray-300">
          Build an Electron app with
          <span className="font-medium">
            <IconBrandReact className="mx-1 mb-1 inline-block" />
            React
          </span>
          &nbsp;and{" "}
          <span className="font-medium">
            <IconBrandTypescript className="mx-1 mb-1 inline-block" />
            TypeScript
          </span>
        </p>

        <p className="text-sm text-gray-500">
          Press <code>`F12`</code> or <code>`Ctrl+Shift+I`</code> to open the
          dev&nbsp;tools
        </p>

        <Versions />

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <a
              href="https://electron-vite.org/"
              target="_blank"
              rel="noreferrer"
            >
              Documentation
            </a>
          </Button>

          <Button type="button" onClick={ipcHandle}>
            Send&nbsp;IPC
          </Button>
        </div>
      </section>
    </main>
  );
}

export default App;
