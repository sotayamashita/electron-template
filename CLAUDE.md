# Guidelines for Claude Code

## Common Commands

- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Format: `pnpm run format`
- Typecheck: `pnpm run typecheck`
- Dev: `pnpm run dev`

## Code Style

- **Formatting**: Uses Prettier with tailwindcss plugin
- **Types**: Explicit TypeScript types, prefer interfaces for objects
- **Imports**: Organize imports, use type imports where appropriate
- **Naming**: PascalCase for components/classes, camelCase for functions/variables
- **Architecture**: Repository pattern with service layer, dependency injection
- **Error Handling**: Use shared error types from `shared/errors.ts`

## Conventions

- Follow Conventional Commits format for commit messages in English
- Keep component files focused on a single responsibility
- Use tRPC for IPC communication between main and renderer
- Persist data using Electron Store via repository pattern
- Follow domain-driven design principles with clear separation of concerns
