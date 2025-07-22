# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development

```bash
pnpm dev                    # Start development server with hot reload
pnpm start                  # Preview the built application
```

### Building

```bash
pnpm build                  # Build for current platform (includes typecheck)
pnpm build:win              # Build for Windows
pnpm build:mac              # Build for macOS
pnpm build:linux            # Build for Linux
pnpm build:unpack           # Build unpacked version for testing
```

### Code Quality

```bash
pnpm lint                   # Run all linters (ESLint, Prettier, TypeScript)
pnpm lint:eslint            # Run ESLint only
pnpm lint:prettier          # Check Prettier formatting
pnpm lint:typecheck         # Run TypeScript type checking (both node and web)
pnpm lint:typecheck:node    # TypeScript check for main/preload processes
pnpm lint:typecheck:web     # TypeScript check for renderer process

pnpm fix                    # Auto-fix all issues (Prettier then ESLint)
pnpm fix:prettier           # Auto-fix Prettier formatting
pnpm fix:eslint             # Auto-fix ESLint issues
```

### Git Workflow

```bash
pnpm commit                # Use commitizen for conventional commits
```

## Architecture Overview

This is an Electron + React application using a modern, layered architecture with type-safe IPC communication.

### Key Architectural Patterns

1. **tRPC over IPC**: Type-safe communication between main and renderer processes
   - Custom adapter in `src/main/trpc-ipc-adapter.ts`
   - Routers in `src/main/trpc/routers/`
   - Client setup in `src/renderer/src/lib/trpc.ts`

2. **Layered Architecture**:
   - **Domain Layer**: Zod schemas in `src/shared/domain/`
   - **Service Layer**: Business logic in `src/main/services/`
   - **Repository Layer**: Data access in `src/main/repository/`
   - **Persistence Layer**: electron-store wrapper in `src/main/persistence/`

3. **Dependency Injection**: Centralized DI container in `src/main/di/container.ts`

4. **Process Structure**:
   - **Main Process**: Node.js environment, handles system operations
   - **Preload Script**: Bridge with exposed APIs
   - **Renderer Process**: React application with UI

### Adding New Features

When adding a new feature (e.g., a new entity like "notes"):

1. Define domain model in `src/shared/domain/notes.ts` using Zod
2. Create repository interface and implementation in `src/main/repository/`
3. Create service in `src/main/services/notes-service.ts`
4. Register in DI container at `src/main/di/container.ts`
5. Create tRPC router in `src/main/trpc/routers/notes.ts`
6. Add router to main router in `src/main/trpc/router.ts`
7. Create React components in `src/renderer/src/components/`

### Path Aliases

- `#shared/*` → `src/shared/*` (available in all processes)
- `@main/*` → `src/main/*` (main process only)
- `@renderer/*` → `src/renderer/src/*` (renderer process only)
- `@/*` → `src/renderer/src/*` (for shadcn/ui compatibility)

### Important Notes

- The project uses ES Modules (`"type": "module"` in package.json)
- Node.js 22+ is required
- All IPC communication goes through tRPC for type safety
- Persistence is handled only in the main process (single source of truth)
- The application supports English and Japanese localization including menus
- Theme persistence (light/dark/system) is built-in
