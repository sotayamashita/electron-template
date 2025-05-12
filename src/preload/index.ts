import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

import type { IPCOperation } from "@main/trpc-ipc-adapter.js";
import type { AppRouter } from "@main/trpc/router.js";
import { createTRPCClient } from "@trpc/client";
import { observable } from "@trpc/server/observable";

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

          ipcRenderer
            .invoke("trpc", enhancedOp)
            .then((data) => {
              observer.next({ result: { data, type: "data" } });
              observer.complete();
            })
            .catch((err) => {
              // Format error for client-side consumption
              if (err && typeof err === "object" && "code" in err) {
                // This is our standardized error format from the adapter
                // Create error with tRPC client error properties
                const appError = new Error(err.message) as unknown as import('@trpc/client').TRPCClientError<typeof trpc>;
                appError.name = err.code;
                // Attach additional properties
                Object.assign(appError, err);
                // Add required tRPC client error properties
                appError.shape = {
                  message: err.message,
                  code: err.code,
                  data: err.data,
                };
                appError.data = err.data;
                observer.error(appError);
              } else {
                // Unexpected error format
                observer.error(err);
              }
            });

          // Return empty cleanup function
          return () => {};
        });
      },
  ],
});

// Setup application API
const api = {
  // Add application-specific API methods here
};

// Expose APIs to renderer via contextBridge
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("trpc", trpc);
  } catch (error) {
    console.error("Failed to expose APIs to renderer:", error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
  // @ts-ignore (define in dts)
  window.trpc = trpc;
}
