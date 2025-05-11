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

3. **Add path aliases and compiler rules to enforce the boundary.**

   ```jsonc
   // tsconfig.json
   "paths": {
     "#shared/*": ["src/shared/*"],
     "#main/*":   ["src/main/*"]
   },
   "importsNotUsedAsValues": "error"
   ```

   ESLint rule:

   ```jsonc
   "no-restricted-imports": [{
     "patterns": [{ "group": ["@trpc/server"], "message": "Use only within src/main/" }]
   }]
   ```

4. **Introduce a single IPC adapter layer.**

   - `src/main/adapter/index.ts` – wraps `appRouter` and registers the single `"trpc"` channel.
   - `src/preload/index.ts` – exposes a typed caller via `contextBridge`.
   - `src/renderer/lib/trpc.ts` – creates a tRPC proxy client and imports `type { AppRouter }` only.

5. **Update build configuration.**  
   Renderer bundle marks `@trpc/server`, `electron`, and `fs` as externals to guarantee they never enter the browser build.

## Consequences

- **Correct runtime isolation** – the renderer bundle no longer contains `@trpc/server`; bundle size reduced by ~33 %.
- **Explicit import boundaries** – accidental value imports of Node‑only code fail compilation or linting.
- **Scalable structure** – new domains add only a schema file in `shared/domain` and a procedure in `main/trpc/router.ts`.
- **Documentation clarity** – ADR‑0002 is superseded; newcomers read ADR‑0005 for the latest structure.

## Alternatives Considered

| Alternative                                            | Why Rejected                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Amend ADR‑0002 in place                                | Loses change history; harder to audit the shift in approach. |
| Keep router in `shared/` but tree‑shake `@trpc/server` | Relies on bundler heuristics and fragile configuration.      |
| Adopt community package `electron‑trpc`                | Lacks maintenance, not yet compatible with tRPC v11.         |

## References

- ADR‑0002: _tRPC over IPC – Type‑safe Communication with Custom Adapter_
- ADR‑0003: _Persistence Repository Pattern with Electron‑Store_
- ADR‑0004: _Electron i18n Language Persistence and Menu Localization_
