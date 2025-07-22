# electron-vite-react-ts

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/sotayamashita/electron-template) [![CI](https://github.com/sotayamashita/just-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/sotayamashita/just-ai/actions/workflows/ci.yml)

An Electron application with React and TypeScript, built with modern architecture patterns and best practices.

## Features

- ✅ **Todo Management** - Create, read, update, and delete todos
- 🌓 **Theme System** - Light, dark, and system theme options with persistence
- 🌐 **Internationalization** - Full i18n support with English and Japanese locales
- 🔄 **Type-safe IPC** - End-to-end type safety with tRPC
- 💾 **Persistence** - Data stored locally with Electron Store
- 🌍 **Menu Localization** - Dynamically translated application menus

## Tech Stack

### Core Technologies

- **Electron** - Cross-platform desktop application framework
- **React 19** - Modern UI library with the latest features
- **TypeScript** - Type-safe JavaScript superset
- **ESM** - Native ES Modules throughout the application
- **Vite** - Next-generation frontend build tool

### State Management & Communication

- **tRPC** - End-to-end typesafe API for IPC communication
- **electron-store** - Persistent storage solution
- **Zod** - Schema validation and type generation

### UI Components & Styling

- **Shadcn/ui** - Re-usable UI components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Internationalization

- **i18next** - Powerful internationalization framework
- **react-i18next** - React bindings for i18next
- **English and Japanese** - Full localization including application UI and menus

## Architecture

The application follows a modern, well-structured architecture:

- **Domain-Driven Design** - Clear domain models with Zod schema validation
- **Repository Pattern** - Abstract persistence layer for data access
- **Service Layer** - Business logic encapsulation
- **Dependency Injection** - Centralized dependency management
- **tRPC over IPC** - Type-safe communication between main and renderer processes

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Code Quality

- **Conventional Commits** - Standardized commit message format
- **TypeScript** - Strong typing throughout the application
- **Prettier & ESLint** - Consistent formatting and linting
- **Pre-commit Hooks** - Automatic linting and formatting

## Architecture Documentation

The project maintains Architecture Decision Records (ADRs) in the `docs/adr` directory, documenting key architectural decisions.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
