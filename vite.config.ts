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
    /**
     * Path aliases for main process
     * These must match the paths in tsconfig.node.json
     */
    resolve: {
      alias: {
        "#shared": resolve("src/shared"), // Universal shared layer (private/internal)
        "@main": resolve("src/main"), // Main process code (public module)
      },
    },
    build: {
      rollupOptions: {
        output: {
          format: "es",
          entryFileNames: "index.mjs",
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()] as PluginOption[],
    /**
     * Path aliases for preload process
     * These must match the paths in tsconfig.node.json
     */
    resolve: {
      alias: {
        "#shared": resolve("src/shared"), // Universal shared layer (private/internal)
        "@main": resolve("src/main"), // Main process code (public module)
      },
    },
    build: {
      rollupOptions: {
        output: {
          format: "es",
          entryFileNames: "index.mjs",
        },
      },
    },
  },
  renderer: {
    /**
     * Path aliases for renderer process
     * These must match the paths in tsconfig.web.json
     */
    resolve: {
      alias: {
        // Renderer-specific aliases
        "@": resolve("src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
        // Universal aliases (must match main & preload)
        "#shared": resolve("src/shared"), // Universal shared layer (private/internal)
        "@main": resolve("src/main"), // Main process code (public module, types only)
      },
    },
    publicDir: resolve("locales"), // Make locales available to the renderer
    build: {
      rollupOptions: {
        /**
         * Prevents Node.js-only dependencies from being bundled into the renderer process.
         * This configuration is critical for:
         * 1. Preventing "You're trying to use @trpc/server in a non-server environment" runtime errors
         * 2. Reducing renderer bundle size by excluding unnecessary server-side code
         * 3. Maintaining proper separation between main and renderer processes
         * 4. Ensuring type-only imports don't accidentally pull in runtime dependencies
         */
        external: ["@trpc/server", "electron", "fs"],
      },
    },
    plugins: [react(), tailwindcss()] as PluginOption[],
  },
});
