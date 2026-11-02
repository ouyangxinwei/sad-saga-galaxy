# Standalone Migration Audit — V01

Date: 2026-11-02
Source repository: https://github.com/ouyangxinwei/sad-saga-galaxy
Source branch: main
Source commit inspected: 29194a74ccd277f49fdfa48e3002f7f82eb2a6dc
Migration branch: standalone-migration

## Scope

Read-only inspection of the source tree, package manifest, Vite/Tailwind configuration, application entry, authentication wiring, game state, and save implementation. No source files were changed during this audit. The migration branch was created from `main`; it currently contains the same source snapshot.

## Repository structure

- 134 tracked files total; 120 files under `src/`.
- Main folders: `base44/`, `src/api/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/pages/`, `src/utils/`.
- UI component library: 53 files under `src/components/ui/`.
- Game presentation: battle (3 files), common (9), dialogs (11), home (6).
- Core game modules include `GameContext.jsx`, `battle.js`, `cards.js`, `gameData.js`, `i18n.js`, and `save.js`.
- Main gameplay pages: Home, Stages, Battle, Formation, Synthesis, Forge, Settings.
- Account-related pages/components: Login, Register, ForgotPassword, ResetPassword, OAuthConsent, AuthContext, AuthLayout, ProtectedRoute, UserNotRegisteredError.

## Current build/runtime stack

- React 18 / React DOM 18
- Vite 8 with the React plugin
- Tailwind CSS 3, PostCSS, Autoprefixer
- React Router DOM 7
- TanStack React Query 5
- Radix UI primitives and locally wrapped UI components
- Framer Motion, Lucide React
- Additional libraries declared: Recharts, Three, React Leaflet, Stripe, React Quill, React Markdown, date-fns, Moment, jsPDF, html2canvas, lodash, Zod, React Hook Form, drag-and-drop and other UI utilities.

The package manifest declares many libraries. This audit has not yet completed a per-import usage scan, so no dependency should be removed solely because it appears optional or uncommon.

## Base44 coupling points

1. `vite.config.js` imports and registers `@base44/vite-plugin`.
2. `src/api/base44Client.js` creates the SDK client using app parameters.
3. `src/lib/app-params.js` imports `getAccessToken` from `@base44/sdk` and reads Base44 environment variables and URL parameters.
4. `src/lib/AuthContext.jsx` calls Base44 public settings and authentication APIs.
5. `src/App.jsx` wraps the application in `AuthProvider` and blocks the gameplay routes based on Base44 auth/public-settings state.
6. The repository README documents `base44 dev` as the supported local command; plain `npm run dev` does not provide the Base44 backend proxy expected by the original setup.

## Game state and persistence

- Game state is initialized with `loadState()` from `src/lib/save.js`.
- Save key: `saga_galaxy_save_v20`.
- Persistence uses browser `localStorage`; `GameContext.jsx` calls `persist(state)` when state changes.
- The save schema includes player progression, resources, card ownership/counts/shards, party/presets, stage progress, check-in, idle rewards, bounties, relics, equipment, shop purchases, and settings.
- The inspected `base44/entities/User.jsonc` defines a User role entity; no dedicated game-save entity was found in the inspected Base44 entity directory.
- Local browser saves are not automatically synchronized between browsers/devices.

## Migration assessment

### Keep in the standalone app
- Existing gameplay pages, battle calculations, game data, card definitions, synthesis rules, UI components, translations, and local save logic should be retained initially.
- Preserve the current save key and schema during the first migration to avoid invalidating existing browser saves.

### Decouple in a separate change
- Replace the Base44 Vite plugin with the standard Vite React plugin configuration.
- Remove the Base44 auth gate from the standalone app entry and decide whether to use a guest/local profile.
- Remove Base44 SDK initialization and account-only routes from the standalone runtime, while keeping original files available in Git history until migration verification is complete.
- Keep save access behind a small storage adapter so cloud sync can be added later without rewriting gameplay logic.

### Verify before release
- Complete a source-wide import/dependency usage scan.
- Install dependencies and run lint, typecheck, and production build in a local environment.
- Test direct route refresh/deep links, local save load/write, export/import strategy, and all main gameplay flows.
- Confirm no runtime code still imports Base44 SDK or expects Base44-injected environment variables.
- Check asset paths, external fonts, and any remote service calls.

## Non-destructive workflow

- Original `main` branch remains unchanged.
- All migration work must be committed only to `standalone-migration` until explicitly approved.
- Do not merge the migration branch into `main` or alter Base44 Builder synchronization without explicit approval.

## Changelog

- V01 (2026-11-02): Created the isolated `standalone-migration` branch and recorded the initial repository structure, stack, Base44 coupling points, save architecture, and migration risks. No gameplay source code changed.
