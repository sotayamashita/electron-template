---
title: "ADR‑0007: License Display in Help Menu"
lastUpdated: 2025-05-14
tags: [adr, electron, licenses, ci]
---

# ADR‑0007: License Display in Help Menu

| Status | Accepted |
| ------ | -------- |

## Context

Open-source projects require proper attribution and license disclosure for the dependencies they use. Our Electron application needs a user-accessible way to view all third-party licenses with an implementation that:

1. Automatically generates up-to-date license information
2. Makes licenses accessible through the Help menu
3. Integrates with our CI/CD pipeline to validate licenses
4. Works with our electron-vite build system

Based on our research in `@docs/research/electron-license-display.md`, there are several approaches to implementing this feature with different trade-offs.

## Decision

We will implement license display using Pattern B (Rollup Plugin approach) since our project uses electron-vite which is Rollup-based. Specifically:

1. Add `rollup-plugin-license` to generate a comprehensive `ThirdPartyNotices.txt` file during build
2. Include this file in the application resources via electron-builder
3. Create a "Licenses" option in the Help menu that opens a BrowserWindow to display the license information
4. Add license checking to CI workflow to validate all dependencies have acceptable licenses

Implementation details:

- Use `rollup-plugin-license` in `electron.vite.config.ts`
- Configure electron-builder to include the generated license file
- Add a "Licenses" menu item to the application menu
- Implement a GitHub Action to check licenses during CI

## Consequences

### Positive

- Ensures legal compliance by providing accessible license information
- Automated process that keeps license information up-to-date
- License checking in CI prevents accidental inclusion of problematic licenses
- Tree-shaking support means only used dependencies are included
- Integrates well with our existing electron-vite workflow

### Negative

- External or native dependencies might be missed and need manual inclusion
- Adds slight complexity to build process
- May require manual formatting adjustments to improve readability

## Alternatives considered

| Alternative                                                 | Why rejected                                                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Pattern A (CLI generation with license-checker-rseidelsohn) | Includes all dependencies regardless of usage, resulting in larger and potentially confusing license files |
| Pattern C (Webpack plugin)                                  | Not fully compatible with our electron-vite build system which is Rollup-based                             |
| Manual license collection                                   | Error-prone and requires maintenance for each dependency update                                            |

## References

- @docs/research/electron-license-display.md
- https://github.com/mjeanroy/rollup-plugin-license
- https://github.com/RSeidelsohn/license-checker-rseidelsohn
- https://github.com/steffen911/license-checker-action
