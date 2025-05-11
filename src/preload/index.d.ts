import type { ElectronAPI } from "@electron-toolkit/preload";
import type { AppRouter } from "@main/trpc/router";
import type { TRPCClient } from "@trpc/client";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    trpc: TRPCClient<AppRouter>;
  }
}
