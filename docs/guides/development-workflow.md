---
title: Dev Workflow Tools
lastUpdated: 2025-05-13
tags:
  [
    development,
    workflow,
    husky,
    lint-staged,
    prettier,
    eslint,
    commitizen,
    commitlint,
  ]
---

# Dev Workflow Tools

> **Version Compatibility**
>
> - Tested with **husky** v9+, **lint‑staged** v15+, **Commitlint** v19+.
> - Node.js 16 or later is recommended (officially supported).
> - Commitizen and Commitlint are kept in sync via `@commitlint/cz-commitlint`.

## Purpose

This document explains how **husky**, **lint‑staged**, **Prettier**, **ESLint**, **Commitizen**, and **Commitlint** are integrated into the commit workflow so developers can keep clean code and correct commit messages **without breaking their flow**. These tools ensure code quality and consistency across the project, including when working with Electron multi-process architecture as described in @docs/research/config.md.

### Why do we need them?

- **Quality assurance** — Automatically runs the formatter and static analysis to catch issues before pull requests.
- **Consistency** — Ensures every developer follows the same style and commit conventions, improving readability and maintainability.
- **Automation** — Eliminates manual checks and enhances the developer experience (DX).

## Tool overview and project‑specific purpose

| Tool            | Role / What                                                                                                                                          | Purpose in this project / Why                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **husky**       | Lightweight runtime for managing Git hooks (e.g., `pre-commit`, `commit-msg`). Automatically sets `core.hooksPath` and simplifies hook distribution. | Runs the formatter and linters before each commit and validates commit messages to enforce quality. |
| **lint‑staged** | Utility that runs commands in parallel only on **staged** files.                                                                                     | Executes Prettier and ESLint on the minimum necessary file set to keep commit delays low.           |
| **Prettier**    | Opinionated code formatter with minimal configuration that enforces a consistent style.                                                              | Removes style debates and eliminates whitespace comments in pull‑requests.                          |
| **ESLint**      | Static analysis tool for JavaScript/TypeScript that detects bugs and anti‑patterns.                                                                  | Uses custom and official rules to catch potential bugs before CI.                                   |
| **Commitizen**  | CLI (`git cz` / `pnpm commit`) that generates Conventional Commits messages through an interactive prompt.                                           | Enables developers to create correct commit messages without memorizing the spec.                   |
| **Commitlint**  | Lints commit messages and enforces compliance with Conventional Commits.                                                                             | Blocks non‑conforming commits via the `commit-msg` hook and re‑checks them in CI.                   |

## Tool interaction diagram

```mermaid
flowchart TD
  D[Developer] -->|git add| S[Staging_Area]
  S --> CZ[Commitizen]
  CZ -->|git commit| H[husky pre-commit]
  H --> LS[lint-staged]
  LS --> P[Prettier / ESLint]
  P --> CM[commit-msg hook]
  CM --> CL[Commitlint]
  CL -->|pass| G[Commit Completed]
```

### Pre‑commit Hooks (husky + lint‑staged)

Husky's **`pre-commit`** hook calls `lint‑staged`, which runs **Prettier → ESLint** in that order on staged files only. The hook is automatically set up via the `prepare` script during `pnpm install`. This ensures each commit maintains consistent code quality, especially important when working with Electron's multi-process architecture described in @docs/research/config.md.

### Commit Convention (Commitizen + Commitlint)

Developers run `git cz` or `pnpm commit` to create a Conventional Commits message via an interactive prompt. The `commit-msg` hook then verifies the message with Commitlint.

### Formatting & Linting

Running `pnpm format` or `pnpm lint` applies Prettier and ESLint to **all** files. These commands are also useful for:

- Ensuring consistent TypeScript configuration across main and renderer processes as per @docs/research/config.md
- Maintaining internationalization strings and structure according to @docs/research/i18n.md

## Workflow steps (summary)

1. Clone the repository and run `pnpm install` (husky hooks are registered automatically).
2. Modify code and stage changes with `git add`.
3. Create a commit message with `git cz` or `pnpm commit`.
4. During the commit, Prettier, ESLint, and Commitlint run in sequence; if any step fails, the commit is aborted.

## Troubleshooting

- **Git hooks are not running** — Check `git config --get core.hooksPath` and verify that it points to the `.husky` directory.
- **`git cz` fails with `ENOENT`** — Use `pnpm commit` or set an alias: `git config --add alias.cz "!pnpm commit"`.
- **ESLint errors in Electron code** — Refer to @docs/research/config.md for best practices regarding Electron multi-process architecture.
- **i18n related formatting issues** — Check @docs/research/i18n.md for proper internationalization patterns.

## Related Documents

- @docs/research/config.md - Electron process communication and configuration management
- @docs/research/i18n.md - Internationalization implementation details
- @docs/adr/ - アーキテクチャ決定記録（ADR）
