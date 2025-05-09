import { ElectronAPI } from "@electron-toolkit/preload";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "../shared/trpc";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    trpc: TRPCClient<AppRouter>;
  }
}
