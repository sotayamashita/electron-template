# ADR‑0002: tRPC over IPC – Type-safe Communication with Custom Adapter

| Status | Accepted   |
| ------ | ---------- |
| Date   | 2025‑05‑07 |

## Context

In Electron applications, communication between Main and Renderer processes (IPC) is necessary, but we need to ensure type safety while maintaining high maintainability. Key requirements:

- Ensure type safety in inter-process communications
- Detect errors early in development through TypeScript type checking
- Maintain security (`contextIsolation: true`, `nodeIntegration: false`)
- Share type definitions from a single source
- Enhance API extensibility for smooth feature additions in the future
- Avoid excessive dependencies on third-party libraries

## Decision

1. **Custom tRPC-over-IPC Adapter Development**

   - Implement our own simple adapter instead of third-party libraries like `electron-trpc` or `trpc-electron`
   - Conduct all communications through a single IPC channel (`trpc`)
   - In the main process, register routers using the `attachTRPC(channel, router)` function
   - In the preload script, expose using `contextBridge.exposeInMainWorld('trpc', client)`

2. **Centralized Shared Type Definitions**

   - Place all shared data types and router definitions in `src/shared/trpc.ts`
   - Implement runtime validation using Zod schemas
   - Make shared types importable from both processes

3. **Directory Structure Optimization**

   ```
   <project-root>/
   ├── src/
   │   ├── main/                     # Main process code
   │   │   └── trpc-ipc-adapter.ts  # Custom adapter implementation
   │   ├── preload/                  # Preload scripts
   │   ├── renderer/                 # Renderer process (React)
   │   │   └── lib/trpc.ts          # Renderer-side client
   │   └── shared/                   # Shared code
   │       └── trpc.ts               # Shared router definitions and types
   ```

4. **Adoption of a Single Channel**

   - Use a single `trpc` channel instead of multiple individual channels
   - Messages formatted as `{ path: 'router.procedure', input: any }`

5. **Client Implementation**

   - Implement using `createTRPCClient` from `@trpc/client` with a custom link
   - Call from renderer as `trpc.task.list.query()`

## Consequences

- **Type Safety**: Prevent type mismatches between processes through compile-time and runtime type checking
- **Enhanced Developer Experience**: Better code completion and safety during refactoring
- **Maintainability**: Less dependency on third-party libraries, easier to adapt to future tRPC version updates
- **Consistency**: Establishment of unified communication patterns throughout the project
- **Security**: Maintaining Electron security best practices such as contextIsolation
- **Extensibility**: Easy addition of new API endpoints and simple validation with Zod

## Alternatives considered

| Alternative                            | Why rejected                                                               |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `electron-trpc` / `trpc-electron`      | Unclear maintenance status, no support for tRPC v11                        |
| Implementation with only `typed-ipc`   | Management becomes complex with increasing channels, redundant patterns    |
| Custom serialization                   | Cannot leverage the advantages of existing libraries (tRPC)                |
| Remote procedure alternative libraries | Potential inconsistency with Electron's security model, increased overhead |

## References

- @docs/electron/ipc.md
- ADR-0003 – Persistence
- https://github.com/sotayamashita/just-ai/pull/8
- https://www.electronjs.org/docs/latest/tutorial/ipc
- https://trpc.io/docs/client
