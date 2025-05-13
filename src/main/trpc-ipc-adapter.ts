import { AppError, InternalError } from "#shared/errors.js";
import type { AnyTRPCRouter, inferRouterContext } from "@trpc/server";
import { ipcMain } from "electron";

/**
 * Type definition for IPC operation
 */
export type IPCOperation = {
  path: string;
  input: unknown;
  requestId?: string;
};

/**
 * Type definition for IPC error response
 */
export type IPCErrorResponse = {
  code: string;
  message: string;
  statusCode: number;
  data?: unknown;
};

/**
 * Attaches a tRPC router to Electron's ipcMain under a single channel name.
 *
 * Renderer side: `ipcRenderer.invoke('trpc', { path: 'task.list', input: { ... } })`
 *
 * This adapter provides:
 * - Dynamic path resolution for nested routers
 * - Standardized error handling
 * - Debugging support with optional request IDs
 * - Context injection
 */
export const attachTRPC = <T extends AnyTRPCRouter>(
  channel: string,
  router: T,
  context?: inferRouterContext<T>,
): void => {
  const caller = router.createCaller(context || {});

  ipcMain.handle(channel, async (_event, op: IPCOperation) => {
    try {
      const { path, input, requestId } = op;

      if (!path) {
        throw new AppError("Missing path in tRPC call", "INVALID_REQUEST", 400);
      }

      // Optional logging for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[tRPC:${requestId || "unknown"}] ${path} call`,
          input ? JSON.stringify(input).substring(0, 200) : "no input",
        );
      }

      // Resolve nested path like "task.list" → caller.task.list
      let current: unknown = caller;
      const segments = path.split(".");

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (current === undefined || current === null) {
          throw new AppError(
            `Invalid path segment: ${segments.slice(0, i).join(".")} is undefined`,
            "NOT_FOUND",
            404,
          );
        }

        current = (current as Record<string, unknown>)[segment];
      }

      if (typeof current !== "function") {
        throw new AppError(`No procedure at path: ${path}`, "NOT_FOUND", 404);
      }

      // Forward single `input` param expected by tRPC procedures
      const result = await (current as (input: unknown) => Promise<unknown>)(
        input,
      );

      // Optional logging for debugging
      if (process.env.NODE_ENV === "development" && requestId) {
        console.log(`[tRPC:${requestId}] ${path} completed`);
      }

      return result;
    } catch (error) {
      // Convert errors to standardized format
      let serializedError: IPCErrorResponse;

      if (error instanceof AppError) {
        serializedError = {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          data: error.details,
        };
      } else {
        const internalError = new InternalError(
          error instanceof Error ? error.message : "Unknown error",
          error,
        );

        serializedError = {
          code: internalError.code,
          message: internalError.message,
          statusCode: internalError.statusCode,
          data:
            process.env.NODE_ENV === "development"
              ? internalError.details
              : undefined,
        };
      }

      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error(`[tRPC] Error in '${channel}':`, serializedError);
      }

      throw serializedError;
    }
  });
};
