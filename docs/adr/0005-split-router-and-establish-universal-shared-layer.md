---
title: "ADR-0005: Split Router into `main/` and Establish Universal Shared Layer"
lastUpdated: 2025-05-11
tags: [adr, architecture, trpc, typescript, shared-layer]
---

# ADR-0005: Split Router into `main/` and Establish Universal Shared Layer

| Status     | Accepted   |
| ---------- | ---------- |
| Date       | 2025-05-11 |
| Supersedes | ADR-0002   |

## Context

ADR‑0002 co‑located both domain types **and** tRPC router construction in `src/shared/trpc.ts`.  
Because the file exports runtime code that depends on `@trpc/server`, any renderer import of shared types accidentally pulls `@trpc/server` into the browser bundle. That leaks Node‑only dependencies, increases bundle size, and causes the runtime error:

```
Error: You're trying to use @trpc/server in a non‑server environment.
```

As the application grows, more routers and shared constants will be added. We need a directory structure and build‑time guardrails that:

- Keep renderer bundles free of Node/Electron code.
- Allow types and pure constants to be shared without friction.
- Scale to additional domains and routers.

## Decision

1. **Move router construction to `src/main/trpc/router.ts`.**  
   `initTRPC.create()` and all procedure implementations now live under `main/`.

   ```ts
   // src/main/trpc/router.ts
   export const appRouter = initTRPC.create()…
   export type AppRouter = typeof appRouter; // exported as *type* only
   ```

2. **Limit `src/shared/` to universal code.**
   - Zod schemas, domain types, and pure constants move to `src/shared/domain/**` and `src/shared/constants.ts`.
   - `src/shared/index.ts` re‑exports types only; it must not export runtime values that depend on Node or Electron.

   Directory structure:

   ```
   src/
   ├── main/
   │   ├── trpc/
   │   │   ├── core.ts           # tRPC initialization
   │   │   ├── router.ts         # Root router
   │   │   └── routers/          # Domain-specific routers
   │   │       ├── theme.ts
   │   │       └── todo.ts
   │   └── trpc-ipc-adapter.ts   # IPC adapter
   ├── shared/
   │   ├── constants.ts          # Universal constants
   │   └── domain/               # Domain types and schemas
   │       ├── theme.ts
   │       └── todo.ts
   └── renderer/
       └── lib/trpc.ts           # Renderer client (imports only types)
   ```

3. **Add path aliases and compiler rules to enforce the boundary.**

   ```jsonc
   // tsconfig.json
   "paths": {
     "#shared/*": ["src/shared/*"],
     "#main/*":   ["src/main/*"]
   },
   "importsNotUsedAsValues": "error"
   ```

   ESLint rules:

   ```jsonc
   "no-restricted-imports": [{
     "patterns": [
       { "group": ["@trpc/server"], "message": "Use only within src/main/" },
       { "group": ["../shared/trpc"], "message": "Import from '@main/trpc/router' instead" }
     ]
   }],
   "@typescript-eslint/consistent-type-imports": ["error", {
     "prefer": "type-imports"
   }]
   ```

   This allows us to detect imports from the old `src/shared/trpc` and enforce that the renderer only imports types, not values.

4. **Introduce a single IPC adapter layer.**
   - `src/main/adapter/index.ts` – wraps `appRouter` and registers the single `"trpc"` channel.
   - `src/preload/index.ts` – exposes a typed caller via `contextBridge`.
   - `src/renderer/lib/trpc.ts` – creates a tRPC proxy client and imports `type { AppRouter }` only.

5. **Update build configuration.**  
   Renderer bundle marks `@trpc/server`, `electron`, and `fs` as externals to guarantee they never enter the browser build.

## Consequences

- **Correct runtime isolation** – the renderer bundle no longer contains `@trpc/server`; bundle size reduced by ~33 %.
- **Explicit import boundaries** – accidental value imports of Node‑only code fail compilation or linting.
- **Scalable structure** – new domains add only a schema file in `shared/domain` and a procedure in `main/trpc/router.ts`.
- **Documentation clarity** – ADR‑0002 is superseded; newcomers read ADR‑0005 for the latest structure.

## Alternatives Considered

| Alternative                                            | Why Rejected                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Amend ADR‑0002 in place                                | Loses change history; harder to audit the shift in approach. |
| Keep router in `shared/` but tree‑shake `@trpc/server` | Relies on bundler heuristics and fragile configuration.      |
| Adopt community package `electron‑trpc`                | Lacks maintenance, not yet compatible with tRPC v11.         |

## Implementation Guide

Here are the steps to migrate to this design:

1. **Move Domain Types**:

   ```bash
   # Create new domain directory
   mkdir -p src/shared/domain

   # Move domain types from shared/trpc.ts to domain files
   # Add type definitions with Zod schemas
   ```

2. **Split tRPC Router**:

   ```bash
   # Create router directory structure
   mkdir -p src/main/trpc/routers

   # Move router logic from shared/trpc.ts
   # Split into domain-specific routers
   ```

3. **Update Import Paths**:

   ```typescript
   // Before
   import { appRouter } from "../shared/trpc";

   // After
   import { appRouter } from "./trpc/router";
   // Or type-only import from renderer
   import type { AppRouter } from "@main/trpc/router";
   ```

4. **Verify Externalization**:

   ```jsonc
   // electron.vite.config.ts
   // renderer.build.rollupOptions.external
   external: ["@trpc/server", "electron", "fs"]
   ```

5. **Testing and Verification**:
   - Debug in renderer to confirm `@trpc/server` related errors are gone
   - Verify all tRPC functions work as before across all features

## Example: Adding New Features

Example of adding a new domain (e.g., user settings):

1. **Define Domain Model**:

```typescript
// src/shared/domain/settings.ts
import { z } from "zod";

export const SettingsSchema = z.object({
  notifications: z.boolean().default(true),
  autoSave: z.boolean().default(false),
  interval: z.number().min(1).max(60).default(5),
});

export type Settings = z.infer<typeof SettingsSchema>;
```

2. **Create Repository**:

```typescript
// src/main/repository/settings-repository.ts
import { SettingsSchema, type Settings } from "#shared/domain/settings.js";
import { Store } from "../persistence/store.js";

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  autoSave: false,
  interval: 5,
};

export const SettingsRepo = {
  get: async (): Promise<Settings> => {
    const store = Store.getInstance();
    const data = store.get("settings") as Settings | undefined;
    return data ?? DEFAULT_SETTINGS;
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    const store = Store.getInstance();
    const current =
      (store.get("settings") as Settings | undefined) ?? DEFAULT_SETTINGS;
    const updated = { ...current, ...settings };
    store.set("settings", updated);
    return updated;
  },
};
```

3. **Create Router**:

```typescript
// src/main/trpc/routers/settings.ts
import { z } from "zod";
import { SettingsSchema, type Settings } from "#shared/domain/settings.js";
import { SettingsRepo } from "../../repository/settings-repository.js";
import { publicProcedure, router } from "../core.js";

export const settingsRouter = router({
  get: publicProcedure.query(async () => {
    return await SettingsRepo.get();
  }),

  update: publicProcedure
    .input(SettingsSchema.partial())
    .mutation(async ({ input }) => {
      return await SettingsRepo.update(input);
    }),
});
```

4. **Add to Root Router**:

```typescript
// src/main/trpc/router.ts - excerpt
import { settingsRouter } from "./routers/settings.js";

export const appRouter = router({
  // Existing routers
  ping: publicProcedure.query(() => "pong"),
  task: todoRouter,
  theme: themeRouter,

  // New router
  settings: settingsRouter,
});
```

5. **Usage Example from Renderer**:

```tsx
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import type { Settings } from "#shared/domain/settings";

function SettingsComponent() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await trpc.settings.get.query();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    })();
  }, []);

  const updateNotifications = async (enabled: boolean) => {
    try {
      const updated = await trpc.settings.update.mutate({
        notifications: enabled,
      });
      setSettings(updated);
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  // Rest of the component
}
```

## References

- ADR‑0002: _tRPC over IPC – Type‑safe Communication with Custom Adapter_
- ADR‑0003: _Persistence Repository Pattern with Electron‑Store_
- ADR‑0004: _Electron i18n Language Persistence and Menu Localization_
