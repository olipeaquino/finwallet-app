# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FinWallet — a personal-finance mobile app (Expo / React Native, TypeScript). All data is local (SQLite + AsyncStorage); there is no backend. UI copy and user-facing strings are in **Brazilian Portuguese (pt-BR)**.

## Commands

```bash
npm start              # Expo dev server (Metro) — then scan QR / pick a target
npm run android        # launch on Android emulator/device
npm run ios            # launch on iOS simulator
npm run web            # run in browser

npm test               # run all Jest tests
npm run test:coverage  # tests with coverage (services/, stores/, utils/)
npx jest __tests__/budgetService.test.ts   # run a single test file
npx jest -t "should alert at 80%"          # run tests matching a name
npx tsc --noEmit       # typecheck (no build/lint script is configured)
```

There is no lint step and no production build script — the app ships through Expo.

## Architecture

Strict three-layer data flow. Respect the boundaries:

```
UI screens (app/**)  →  Zustand stores (stores/)  →  Services (services/)  →  SQLite (db/)
```

- **Services** (`services/*.ts`) are the *only* layer that touches the database. Each is a plain object of `async` methods that call `getDatabase()` and run raw SQL. Add new persistence logic here, never in components.
- **Stores** (`stores/*.ts`, Zustand) hold UI state plus derived aggregates and orchestrate services. They never run SQL directly.
- **`transactionStore.refreshAll()`** is the central invalidation point: it re-runs all fetches in parallel. After any mutation that affects balances/summaries, call it (the existing `addTransaction`/`updateTransaction`/`deleteTransaction` already do).
- **`settingsStore`** is the exception to "everything in SQLite": it uses Zustand `persist` → AsyncStorage (key `finwallet-settings`) for theme, currency, notification/biometric toggles, onboarding flag.

### Database

- Single SQLite connection (singleton in `db/database.ts`), opened lazily via `getDatabase()`.
- Schema lives in `db/schema.ts` as raw `CREATE TABLE` strings (`SCHEMA_STATEMENTS`). Foreign keys are enabled (`PRAGMA foreign_keys = ON`).
- Initialized once at startup by `AppInitializer` in `app/_layout.tsx`, which also seeds `DEFAULT_CATEGORIES` (only if the table is empty).
- Tables: `categories`, `transactions`, `goals`, `goal_deposits` (cascade-deletes with its goal), `budgets` (unique per `category_id, month, year`).
- There is no migration system (`SCHEMA_VERSION = 1`, `CREATE TABLE IF NOT EXISTS`). Schema changes to existing tables won't apply to installed DBs — use `resetDatabase()`/`clearAllData()` in `db/database.ts` during development.

### Money

**All monetary amounts are stored and passed around as integer cents.** Divide by 100 only at display time and format with `pt-BR` / BRL (e.g. `(amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`). Never store floats.

### Routing & app shell

- File-based routing via **Expo Router** (`app/`), with typed routes enabled. Main UI is the `(tabs)` group; `transaction/new` and `goal/new` are presented as modals (see `app/_layout.tsx`).
- Provider stack (root `app/_layout.tsx`): `GestureHandlerRootView` → `QueryClientProvider` → `ThemeProvider` → `AppInitializer` (DB init) → `AuthGate` (biometric lock) → screens, with `<DialogHost />` mounted alongside.
- `@tanstack/react-query` is configured but most data flows through Zustand stores; prefer the store pattern unless extending existing React Query usage.

### Conventions

- **Styling:** NativeWind (Tailwind) via `className`. Dark mode uses `dark:` variants. Design tokens (colors, gradients, `glow`, elevation, typography, spacing) come from `constants/` — import from `@/constants`, don't hardcode hex values.
- **Theme:** preference (`light`/`dark`/`system`) is persisted in `settingsStore`; `useTheme()` computes `isDark`; `ThemeProvider` syncs it to NativeWind. In components use `useThemeContext()` for `isDark` / `toggleTheme`.
- **Dialogs/alerts:** do **not** use React Native's `Alert`. Use `showDialog` / `showAlert` from `@/components/ui` — an imperative API wired through the single `<DialogHost />`.
- **IDs:** generate with `generateUUID()` from `@/utils`.
- **Path aliases:** `@/*` maps to the repo root (plus `@/components/*`, `@/services/*`, etc. — see `tsconfig.json`).
- **Reusable components** live in `components/ui/` (`Button`, `Card`, `Input`, `AmountDisplay`, `ProgressRing`, etc.) and `components/charts/` (Victory-based). Import via the barrel `@/components/ui`.

## Testing nuance (important)

Tests in `__tests__/` **re-implement the business logic inline** (thresholds, formatting, progress math) rather than importing the service modules — they validate the algorithm in isolation. Consequences:

- `jest.config.js` runs only files under `__tests__/` in a `node` environment and does **not** wire in `jest.setup.js` (the expo/native mocks there are currently unused).
- When you change a business rule in a service (e.g. budget alert threshold, currency formatting), update both the service **and** its mirrored copy in the corresponding test file, or the test will silently keep passing against stale logic.

## Notes

- Several services carry `// @ts-nocheck` (`analyticsService`, `budgetService`, `exportService`, `notificationService`). Be cautious editing them — TypeScript won't catch type errors there.
- New Architecture (Fabric/TurboModules) is enabled (`newArchEnabled: true`).
