# Contributing to DailySafe

Thanks for your interest in improving DailySafe. This is a small, local-first app with a few hard constraints (see below) — please read those before proposing a change that touches architecture.

## Getting set up

```bash
git clone https://github.com/soyleremo3/DailySafe.git
cd DailySafe
npm install
npm start
```

You'll need [Node.js](https://nodejs.org) 20+ and the [Expo Go](https://expo.dev/go) app (or a simulator/emulator) to run the project.

## Before you open a PR

Run the full check suite locally — CI runs the same checks:

```bash
npm run typecheck
npm run lint
npm test
```

## Project constraints

These are intentional and any PR that violates them will need a strong justification:

- **Local-first, no backend.** No account system, no cloud sync, no analytics, no ads, no tracking. See [AGENTS.md](AGENTS.md) and [SECURITY.md](SECURITY.md).
- **No FX/currency-conversion API.** DailySafe works in a single currency at a time.
- **No real billing integration.** The Pro paywall uses a development-only mock entitlement (`settings.isProDev`). Don't wire up a payment SDK without discussing it first in an issue.
- **The safe-to-spend engine is pure TypeScript** (`src/domain/`), with no React Native imports. Keep it that way — it's what makes the core calculation fast and easy to unit test.

## Coding conventions

- TypeScript strict mode; avoid `any` where a real type is reasonable.
- Prefer editing existing shared components (`src/components/`) over creating new one-off UI.
- Business logic belongs in `src/domain/` and should be covered by tests in `src/domain/__tests__`. UI components should stay thin and call into the domain layer / Zustand store (`src/store/useAppStore.ts`) rather than re-implementing calculations.
- Run `npm run lint -- --fix` for formatting/lint auto-fixes before committing.
- Keep commits small and focused; write commit messages that explain *why*, not just *what*.

## Reporting bugs / requesting features

Please use the issue templates under `.github/ISSUE_TEMPLATE`. Include reproduction steps for bugs, and the problem you're trying to solve (not just the solution) for feature requests.

## Security issues

Do not open a public issue for a security vulnerability — see [SECURITY.md](SECURITY.md) for how to report one privately.
