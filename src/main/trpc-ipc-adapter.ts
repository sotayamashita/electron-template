import type { AnyTRPCRouter } from "@trpc/server";
import { ipcMain } from "electron";

/**
 * Attaches a tRPC router to Electron's ipcMain under a single channel name.
 *
 * Renderer side: `ipcRenderer.invoke('trpc', { path: 'task.list', input: { ... } })`
 *
 * This adapter keeps the implementation minimal—sufficient for manual debugging
 * and small prototypes. It supports arbitrarily‑nested routers because it
 * resolves the `path` segments dynamically.
 */
export const attachTRPC = <T extends AnyTRPCRouter>(
  channel: string,
  router: T,
): void => {
  const caller = router.createCaller({});

  ipcMain.handle(
    channel,
    async (_event, op: { path: string; input: unknown }) => {
      const { path, input } = op;
      // Resolve nested path like "task.list" → caller.task.list
      let current: unknown = caller;
      for (const segment of path.split(".")) {
        current = (current as Record<string, unknown>)[segment];
      }
      // Forward single `input` param expected by tRPC procedures
      return (current as (input: unknown) => unknown)(input);
    },
  );
};
