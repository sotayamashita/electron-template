/****
 * Shim Vite configuration file
 *
 * Why this file exists:
 * 1. Tools such as **shadcn/ui** verify a project by searching for
 *    `vite.config.{ts,js}`. Electron‑Vite, however, names its main config
 *    `electron.vite.config.ts`, so those CLIs fail to detect Vite and abort.
 * 2. This file is therefore a *verbatim* copy of `electron.vite.config.ts`
 *    whose only purpose is to satisfy framework‑detection logic.  Electron‑Vite
 *    itself does **not** load or rely on this shim at runtime.
 *
 * How to maintain:
 * – Keep the plugin lists, aliases, and any other build options in sync with
 *   `electron.vite.config.ts`; they must remain identical to avoid divergence.
 * – If Electron‑Vite adds new sections (e.g. `worker`), reflect them here.
 *
 * 👉  Never import this file in application code. It exists solely for
 *     third‑party tooling that expects the canonical Vite filename.
 *
 * @see https://github.com/shadcn-ui/ui/issues/4885
 * @see https://github.com/shadcn-ui/ui/issues/5005
 */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import type { PluginOption } from "vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()] as PluginOption[],
  },
  preload: {
    plugins: [externalizeDepsPlugin()] as PluginOption[],
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react(), tailwindcss()] as PluginOption[],
  },
});
