import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import type { PluginOption } from "vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()] as PluginOption[],
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
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react(), tailwindcss()] as PluginOption[],
  },
});
