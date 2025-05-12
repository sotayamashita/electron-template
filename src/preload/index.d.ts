import type { ElectronAPI } from "@electron-toolkit/preload";
import type { AppRouter } from "@main/trpc/router";
import type { TRPCClient } from "@trpc/client";

interface API {
  i18n: {
    initialLng: string;
    onLanguageChanged: (callback: (lng: string) => void) => () => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
    trpc: TRPCClient<AppRouter>;
    initialLng: string; // For direct access in bootstrapI18n
  }
}
