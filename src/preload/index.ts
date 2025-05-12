import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

import type { IPCOperation } from "@main/trpc-ipc-adapter.js";
import type { AppRouter } from "@main/trpc/router.js";
import { createTRPCClient } from "@trpc/client";
import { observable } from "@trpc/server/observable";

// Import initial language synchronously to avoid flicker
// This is imported directly from Electron's main process
// using a special IPC channel that returns the value synchronously
const initialLng = ipcRenderer.sendSync("get-initial-language") as string;

/**
 * Generate a unique request ID for tracing
 */
const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

/**
 * Create a tRPC client with enhanced error handling and tracing
 */
const trpc = createTRPCClient<AppRouter>({
  links: [
    () =>
      ({ op }) => {
        // Add request ID for tracing in development
        const requestId =
          process.env.NODE_ENV === "development"
            ? generateRequestId()
            : undefined;

        const enhancedOp: IPCOperation = {
          ...op,
          requestId,
        };

        return observable((observer) => {
          // Optional logging in dev mode
          if (process.env.NODE_ENV === "development") {
            console.log(`[tRPC:${requestId}] Client calling ${op.path}`);
          }

          // Ensure IPC channel is available
          if (!ipcRenderer) {
            console.error("[tRPC Client] No ipcRenderer available");
            // Just pass a generic error - tRPC client will handle it
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            observer.error(new Error("IPC renderer not available") as any);
            return (): void => {};
          }

          ipcRenderer
            .invoke("trpc", enhancedOp)
            .then((data) => {
              observer.next({ result: { data, type: "data" } });
              observer.complete();
            })
            .catch((err) => {
              // Format error for client-side consumption
              if (err && typeof err === "object" && "code" in err) {
                // tRPC errors require a specific format - we'll need to simulate it
                // By just passing the raw error data
                if (process.env.NODE_ENV === "development") {
                  console.error(`[tRPC:${requestId}] Error:`, err);
                }
                observer.error(err);
              } else {
                // Unexpected error format
                console.error(`[tRPC:${requestId}] Unexpected error:`, err);
                observer.error(err);
              }
            });

          // Return empty cleanup function
          return (): void => {};
        });
      },
  ],
});

// Setup application API
const api = {
  // Add application-specific API methods here

  // i18n related API
  i18n: {
    // Initial language value - available synchronously to prevent flicker
    initialLng,

    // Listen for language change events from the main process
    onLanguageChanged: (callback: (lng: string) => void): (() => void) => {
      const listener = (_: unknown, lng: string): void => callback(lng);
      ipcRenderer.on("language-changed", listener);
      return (): void => {
        ipcRenderer.removeListener("language-changed", listener);
      };
    },
  },
};

// Expose APIs to renderer via contextBridge
if (process.contextIsolated) {
  try {
    // Expose initialLng directly for bootstrapping i18n before React renders
    contextBridge.exposeInMainWorld("initialLng", initialLng);

    // Expose standard APIs
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("trpc", trpc);
  } catch (error) {
    console.error("Failed to expose APIs to renderer:", error);
  }
} else {
  // @ts-ignore (define in dts)
  window.initialLng = initialLng;
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
  // @ts-ignore (define in dts)
  window.trpc = trpc;
}
