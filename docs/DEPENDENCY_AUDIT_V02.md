# Dependency and Platform Reference Audit V02

Branch: `standalone-migration`
Audit date: 2026-11-02
Scope: static review of the package manifest, application entry points, core game modules, gameplay pages, game UI/dialog modules, and selected shared UI primitives.

> Status: **first-pass audit, not a complete exhaustive import graph**. The repository contains 120 files under `src/`; not every file has yet been individually inspected. GitHub code-search returned inconsistent/no matches for several package queries, so absence of a search result is not treated as proof that a dependency is unused. No dependencies or application source files were changed in this audit.

## 1. Keep for the standalone game

| Dependency / area | Evidence | Recommendation |
|---|---|---|
| `react`, `react-dom` | Application and gameplay components use React | Keep |
| `react-router-dom` | App routes, navigation, links, battle navigation | Keep |
| `framer-motion` | Battle arena and game modal animations | Keep |
| `lucide-react` | Game icons and shared UI components | Keep |
| `@tanstack/react-query` | App wraps the game in QueryClientProvider; query client module exists | Keep initially; re-evaluate after entry-point simplification |
| `clsx`, `tailwind-merge` | `src/lib/utils.js` uses both | Keep |
| `class-variance-authority` | Shared UI primitives (e.g. button/label/toast) use CVA | Keep while those primitives remain |
| Tailwind/PostCSS/Autoprefixer | Existing styling and build configuration | Keep |
| `@radix-ui/react-toast` | Toast primitive is imported by the app's toaster | Keep |
| `@radix-ui/react-slot` | Button primitive uses Slot | Keep if button primitive retained |
| `@radix-ui/react-label` | Label primitive uses Radix Label | Keep only if label/auth UI retained |
| `input-otp` | OTP input component is used by Register page | Remove only after Base44 registration route is removed and import graph rechecked |

Game modules to preserve: `GameContext.jsx`, `battle.js`, `cards.js`, `gameData.js`, `i18n.js`, `save.js`, gameplay pages, battle components, game dialogs and home components.

## 2. Base44-bound code: remove or replace in standalone target

| File / package | Evidence | Standalone action |
|---|---|---|
| `@base44/sdk` | Imported by `base44Client.js` and `app-params.js`; auth modules call SDK methods | Remove after all Base44 imports and routes are detached |
| `@base44/vite-plugin` | Registered in `vite.config.js` | Replace with standard Vite + React config |
| `src/api/base44Client.js` | Creates Base44 client | Not needed in standalone build |
| `src/lib/app-params.js` | Reads Base44 app ID, token and functions version | Not needed in standalone build |
| `src/lib/AuthContext.jsx` | Loads Base44 public settings and user auth | Replace auth gate with local/guest entry or remove provider |
| `src/lib/authMfa.js` | Base44 auth/MFA endpoints and SDK | Not needed in standalone build |
| `src/lib/authReturnTo.js` | Return URL handling for auth flow | Remove if no remaining consumer |
| `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `OAuthConsent.jsx` | Base44 authentication screens | Exclude from standalone routes; remove only after reference check |
| `src/components/ProtectedRoute.jsx`, `AuthLayout.jsx`, `GoogleIcon.jsx`, `UserNotRegisteredError.jsx` | Auth-related components | Likely removable once no route/import references remain |
| `src/lib/PageNotFound.jsx` | Calls `base44.auth.me()` | Rewrite as ordinary local 404 page or replace |
| `base44/` directory | Base44 app config and User entity | Not required by a static standalone client; retain in this migration branch until migration is validated |

Important: this is a standalone-target removal list, not an instruction to delete these files from the Base44-connected source branch.

## 3. Candidate dependencies to investigate before removal

The manifest declares the following packages for which this first-pass review has not established a gameplay import. Do **not** uninstall them until a complete import scan, including all UI primitives and transitive/local imports, is complete:

- Data/visualization: `recharts`, `three`, `react-leaflet`
- Rich content/export: `react-markdown`, `react-quill-new`, `jspdf`, `html2canvas`
- Forms/validation: `react-hook-form`, `@hookform/resolvers`, `zod`
- Drag/drop: `@hello-pangea/dnd`
- Date/time: `date-fns`, `moment`, `react-day-picker`
- Notifications/themes: `sonner`, `react-hot-toast`, `next-themes`
- Other: `lodash`, `canvas-confetti`, `embla-carousel-react`, `react-resizable-panels`, `vaul`, `cmdk`

The Radix UI packages must be treated individually. Many are dependencies of generated `src/components/ui/*` wrappers; the wrappers themselves may be unused by gameplay but can have internal imports. A dependency should only be removed after the corresponding wrapper and its importers are proven unreachable.

## 4. External runtime and persistence observations

- `src/lib/save.js` stores game state in localStorage under `saga_galaxy_save_v20`.
- The save schema is version 20. Preserve the key and schema during the first standalone migration to avoid losing existing browser progress.
- `src/lib/authMfa.js` makes Base44-specific `fetch()` calls under `/api/apps/...`; these belong to authentication, not the game loop.
- `index.html` currently references the Base44 logo as favicon; replace with project-owned local asset or a neutral favicon during standalone packaging.
- The manifest link exists in `index.html`; verify that `manifest.json` and its icons are present in the complete tree before PWA testing.
- No cloud game-save entity was identified in the previously inspected Base44 entity directory; current gameplay persistence is browser-local.

## 5. Remaining checks before changing package.json

1. Finish file-by-file import graph across all 120 `src/` files, including all `components/ui` wrappers.
2. Resolve every local import and detect unreachable modules.
3. Scan all source/config/assets for external URLs, fetch/XHR, analytics, and Base44 references.
4. Confirm the exact PWA manifest/service-worker/icon inventory.
5. Run install, lint, typecheck and production build in a real Node environment; GitHub file inspection alone does not prove build success.
6. Only then produce a minimal dependency diff and apply it on `standalone-migration`.

## 6. Change log

- V01: Initial migration structure and Base44/local-save architecture audit.
- V02: Added first-pass dependency/platform-reference findings, initial keep/remove/candidate lists, and explicit remaining verification tasks. No runtime code or dependencies changed.
