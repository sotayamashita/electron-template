# Contributor Guidelines

## Development
- Use `pnpm` for package management.
- Install dependencies with `pnpm i`.
- Run `pnpm lint` and `pnpm typecheck` before committing.
- Format code with `pnpm format`.

## Commit Messages
- Use [Conventional Commits](https://www.conventionalcommits.org/) style.

## Dev Environment Tips
- Use `pnpm dlx turbo run where <project_name>` to quickly navigate to a package.
- Run `pnpm install --filter <project_name>` so Vite, ESLint and TypeScript can detect it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to generate a new React + Vite package.
- Check the `name` field inside each package's `package.json`—skip the top-level one.

