import type { IPCOperation } from "@main/trpc-ipc-adapter";
import type { AppRouter } from "@main/trpc/router";
import { createTRPCClient, type Operation } from "@trpc/client";
import { observable } from "@trpc/server/observable";

/**
 * Generate a unique request ID for tracing
 */
const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

/**
 * Custom IPC link that calls main-process router via ipcRenderer.
 * Handles error formatting and optional tracing in development.
 */
const ipcLink =
  () =>
  ({ op }: { op: Operation }) => {
    // Add request ID for tracing in development
    const requestId =
      process.env.NODE_ENV === "development" ? generateRequestId() : undefined;

    const enhancedOp: IPCOperation = {
      ...op,
      requestId,
    };

    return observable((observer) => {
      // Optional logging in dev mode
      if (process.env.NODE_ENV === "development") {
        console.log(`[tRPC:${requestId}] Renderer calling ${op.path}`);
      }

      // `electron` API is exposed by preload.
      window.electron.ipcRenderer
        .invoke("trpc", enhancedOp)
        .then((data) => {
          observer.next({ result: { type: "data", data } });
          observer.complete();
        })
        .catch((err) => {
          // Format error for UI consumption
          if (err && typeof err === "object" && "code" in err) {
            // This is our standardized error format from the adapter
            console.error(
              `[tRPC:${requestId}] Error (${err.code}): ${err.message}`,
            );
          } else {
            console.error(`[tRPC:${requestId}] Unexpected error:`, err);
          }
          observer.error(err);
        });

      // Return empty cleanup function
      return () => {};
    });
  };

/**
 * tRPC client for calling main process procedures
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [ipcLink],
});

/**
 * Error handler helper for tRPC operations
 * @param error The error to handle
 * @param fallbackMessage Default message if error is not formatted
 * @returns User-friendly error message
 */
export const handleTRPCError = (
  error: unknown,
  fallbackMessage = "An unexpected error occurred",
): string => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallbackMessage;
};
