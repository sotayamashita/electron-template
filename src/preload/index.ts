import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

import { createTRPCClient } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "../shared/trpc.js";

// Custom APIs for renderer
// tRPC client (custom IPC link)
const trpc = createTRPCClient<AppRouter>({
  links: [
    () =>
      ({ op }) =>
        observable((observer) => {
          ipcRenderer
            .invoke("trpc", op)
            .then((data) => {
              observer.next({ result: { data, type: "data" } });
              observer.complete();
            })
            .catch((err) => observer.error(err));
          return () => {};
        }),
  ],
});

const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("trpc", trpc);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
  // @ts-ignore (define in dts)
  window.trpc = trpc;
}
