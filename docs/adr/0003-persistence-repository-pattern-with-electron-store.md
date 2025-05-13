---
title: "ADR‑0003: Persistence – Repository Pattern with electron-store"
lastUpdated: 2025-05-09
tags: [adr, persistence, repository-pattern, electron-store]
---

# ADR‑0003: Persistence – Repository Pattern with electron-store

| Status | Accepted   |
| ------ | ---------- |
| Date   | 2025‑05‑09 |

## Context

Our Electron application requires persistence for various types of data, including:

- User preferences (theme)
- Application state (Todo list items)

Key requirements:

- Type safety across the entire persistence layer
- Single source of truth in the Main process
- Integration with existing tRPC-based IPC communication
- Performance optimization for module loading
- Schema validation for stored data

## Decision

1. **electron-store as Primary Persistence Mechanism**

   - Adopt `electron-store` for JSON-based persistence in the Main process
   - Implement lazy-loading via dynamic ESM imports to optimize startup time
   - Create a type-safe wrapper with a defined schema for all stored data

2. **Repository Pattern for Data Access**

   - Implement domain-specific repositories:
     - `TodoRepository`: CRUD operations for todo list items
     - `ThemeRepository`: Get/set theme preferences
   - Each repository exposes async methods that handle store access

3. **tRPC Router Integration**

   - Refactor tRPC procedures to delegate to repository methods
   - Return complete updated lists after mutations for consistency
   - Define shared schemas in `trpc.ts` for both Main and Renderer processes

4. **Single Source of Truth**

   - Store all persistent data exclusively in the Main process
   - Remove Renderer-side persistence (localStorage)
   - Maintain UI state synchronization via tRPC procedures

5. **Type-Safe Access**

   - Define consistent schema types shared between processes
   - Use Zod for runtime validation of data
   - Leverage TypeScript for compile-time safety

## Consequences

- **Type Safety**: End-to-end type checking from UI to persistence layer
- **Simplified State Management**: UI components now rely on server-returned data
- **Performance**: Lazy-loading minimizes startup impact
- **Consistency**: Single source of truth ensures data integrity
- **Maintainability**: Clear separation of concerns with the repository pattern
- **Extensibility**: Pattern easily accommodates additional persistent data types

## Alternatives considered

| Alternative                         | Why rejected                                                  |
| ----------------------------------- | ------------------------------------------------------------- |
| localStorage in Renderer            | Fragments data across processes; lacks Main process access    |
| In-memory only with optional export | Doesn't meet persistence requirements across restarts         |
| SQLite database                     | Overkill for current simple data requirements                 |
| Direct electron-store usage         | Repository abstraction provides better separation of concerns |
| Eager loading of electron-store     | Dynamic import improves startup performance                   |

## References

- @docs/electron/storage.md
- ADR‑0002 – tRPC over IPC
- ADR‑0004 – Electron i18n – Language Persistence & Menu Localization
- https://github.com/sindresorhus/electron-store
- https://github.com/sotayamashita/just-ai/pull/10
