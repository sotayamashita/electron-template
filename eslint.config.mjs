import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginReactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/out",
      // Shadcn UI
      "src/renderer/src/components/ui",
      "src/renderer/src/lib/utils.ts",
    ],
  },
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": eslintPluginReactHooks,
      "react-refresh": eslintPluginReactRefresh,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      // Only forbid the root package in non‑main code.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@trpc/server",
              message: "Import @trpc/server only inside src/main/",
            },
          ],
        },
      ],
      // Always use `import type` for only types.
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["src/main/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  eslintConfigPrettier,
);
