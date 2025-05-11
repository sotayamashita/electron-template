# ADR‑0004: Electron i18n – Language Persistence & Menu Localization

| Status | Accepted   |
| ------ | ---------- |
| Date   | 2025‑05‑11 |

## Context

Our Electron + React desktop application must support multiple languages in **both** the renderer UI and the native application menu. Key requirements:

- Persist the user’s chosen language across restarts.
- No first‑paint flicker; the correct language must be visible from the very first frame.
- Enable live language switching at runtime.
- Preserve our security posture (`contextIsolation: true`, `nodeIntegration: false`).
- Integrate cleanly with our current stack (electron‑vite, TypeScript, Tailwind/shadcn, tRPC, electron‑store).

## Decision

1. **Persistence**

   - Store the selected language in `electron-store` under `userLanguage` (default: `"en"`).
   - Access is wrapped by `langRepository` to ensure only `SUPPORTED_LOCALES` are stored.

2. **i18n libraries**

   - **Main process**: `i18next` + `i18next‑fs‑backend` to read JSON resources from `locales/{lng}/{ns}.json`.
   - **Renderer**: `i18next` + `react‑i18next` with translations bundled via `@kainstar/vite-plugin-i18next-loader`.

3. **Initial language bootstrap**

   - The preload script synchronously calls `langRepository.get()` and exposes `window.initialLng`.
   - Renderer executes `bootstrapI18n(window.initialLng)` _before_ React renders, preventing flicker.

4. **IPC layer (tRPC)**

   - Add a `lang` router with `get` and `set` procedures.
   - Renderer invokes `lang.set(lng)` immediately after `i18n.changeLanguage(lng)` to persist changes.

5. **Native menu localisation**

   - Main holds a dedicated `i18next` instance; menu templates use `i18n.t('Menu.File')`, etc.
   - On `i18n.languageChanged`, the menu is rebuilt and reapplied via `Menu.setApplicationMenu`.

6. **Runtime language switching sequence**

   1. Renderer → `i18n.changeLanguage(lng)`
   2. Renderer → `trpc.lang.set(lng)`
   3. Main persists to store, calls `i18n.changeLanguage(lng)`, rebuilds menu, broadcasts `languageChanged`.
   4. All renderer windows receive the event and call `i18n.changeLanguage(lng)` locally.

7. **Directory layout for translations**

```text
<project-root>/
  locales/
    en/
      common.json
      menu.json
    ja/
      common.json
      menu.json
```

## Consequences

- **Zero flicker** at startup—language is known synchronously.
- Renderer and native menu stay in sync without exposing filesystem APIs to the renderer.
- Offline‑first: translations are bundled (renderer) or read from ASAR (main).
- Security best‑practices upheld: renderer never touches the filesystem directly.

## Alternatives considered

| Alternative                                      | Why rejected                                       |
| ------------------------------------------------ | -------------------------------------------------- |
| Fetch language via tRPC before first render      | Adds a loading splash or flicker.                  |
| Share a single i18next instance across processes | Breaks isolation, introduces brittle global state. |
| Use `i18next-electron-fs-backend` in renderer    | Unnecessary once resources are bundled by Vite.    |

## References

- @docs/electron/i18n.md
- @docs/electron/storage.md
- ADR‑0001 – Project bootstrap
- ADR‑0002 – tRPC over IPC
- ADR-0003 – Persistence
