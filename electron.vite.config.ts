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
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react(), tailwindcss()] as PluginOption[],
  },
});
