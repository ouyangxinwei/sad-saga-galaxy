# Dependency and Source Import Audit V03

> Branch: `standalone-migration`  
> Scope: static source/import-graph audit for the independent React/Vite migration.  
> Status: completed source-path pass; not a runtime/build verification.

## 1. Changelog

- **V01** — Initial migration audit: identified the Base44 integration surface, application structure, and local save mechanism.
- **V02** — First dependency/platform-boundary review: documented the initial keep/review/remove-candidate groups and explicitly marked the scan as incomplete.
- **V03** — Expanded the scan across all 120 tracked `src/` files, including all 53 files under `src/components/ui/`; traced the game route entry points, toast dependency chain, Base44 auth chain, UI-wrapper-only references, and root build/lint configuration. No runtime source, dependency manifest, or configuration was changed.

## 2. Scope and method

The Git tree for `standalone-migration` contained 136 tracked files at the time of this audit, including **120 files under `src/`** and **53 UI component files**. The scan reviewed:

- Application entry: `src/main.jsx`, `src/App.jsx`
- Seven game routes: Home, Stages, Battle, Formation, Synthesis, Forge, Settings
- Game components, dialogs, hooks, and `src/lib/`
- All files in `src/components/ui/`
- `package.json`, Vite/Tailwind/PostCSS/ESLint configuration, `index.html`, `src/index.css`, `components.json`, and README

Imports were traced statically from the application entry and game routes. The review also checked direct package imports, local component-to-component imports, CSS/config usage, and Base44 API call sites.

**Limitations:** this is a manual/static import-graph review, not a parser-generated exhaustive graph. Dynamic imports, runtime-generated module paths, package side effects, browser behavior, and dependency compatibility have not been tested. A package with no visible import in the reviewed source is classified as a removal candidate, not proof that removal is safe in every future development workflow.

## 3. Application graph findings

### 3.1 Active game route chain

`src/main.jsx` mounts `src/App.jsx`. The app currently registers these game routes:

- `/` → Home
- `/stages` → Stages
- `/battle` → Battle → BattleArena
- `/formation` → Formation
- `/synthesis` → Synthesis
- `/forge` → Forge
- `/settings` → Settings
- `*` → PageNotFound

The game pages reach the game-specific component tree under `components/common`, `components/home`, `components/dialogs`, and `components/battle`, plus the game modules in `src/lib/`.

The game domain modules with direct route/component usage include:

- `GameContext.jsx`
- `battle.js`
- `cards.js`
- `gameData.js`
- `i18n.js`
- `format.js`
- `save.js`

### 3.2 UI component reachability

The app entry imports `Toaster` from `src/components/ui/toaster.jsx`. That creates the currently confirmed UI dependency chain:

`App.jsx` → `toaster.jsx` → `use-toast.jsx` + `toast.jsx` → `@radix-ui/react-toast`, `class-variance-authority`, `lucide-react`, and local `utils.js`.

The game route files and their directly imported game components do not import the remaining UI wrapper components in the scanned source. Many UI wrappers reference Radix packages or helper packages, but those are references from currently unreferenced wrapper files rather than from the active game route graph.

This distinction matters:
- A package can be referenced somewhere in the repository but not be needed by the current game route bundle.
- If the migration intends to preserve the entire generated UI component library for future use, retain those packages.
- If the standalone deliverable is intentionally reduced to the current game routes, the orphan wrappers and their exclusively used packages can be considered for removal in a later, separately approved cleanup.

### 3.3 Base44 and authentication chain

The current app is not yet standalone because `App.jsx` wraps the game in `AuthProvider` and renders `AuthenticatedApp`, which waits for auth/public-settings state and may redirect to login.

Confirmed Base44 integration points include:

- `vite.config.js` imports and registers `@base44/vite-plugin`.
- `src/api/base44Client.js` imports `createClient` from `@base44/sdk`.
- `src/lib/app-params.js` imports `getAccessToken` from `@base44/sdk` and reads Base44 environment parameters.
- `src/lib/AuthContext.jsx` uses the Base44 client and app parameters.
- `src/lib/authMfa.js` calls Base44 auth endpoints and writes Base44 tokens.
- `src/lib/PageNotFound.jsx` calls `base44.auth.me()` through React Query.
- Login/register/password reset/OAuth components reference Base44 auth modules. These pages are not among the seven game routes currently registered in `App.jsx`, but they remain tracked source files.

Therefore, removing only the login pages or only the SDK package would not complete the standalone migration. The app root, auth provider, 404 route, Vite plugin, and Base44 helper modules must be addressed together in a future implementation step.

### 3.4 Save data

`src/lib/save.js` persists game state through browser `localStorage` using key:

`saga_galaxy_save_v20`

The save schema is version 20. The standalone migration should preserve this key and existing serialization/migration behavior so existing browser saves are not silently orphaned.

### 3.5 PWA and branding observations

- `index.html` still uses the Base44 hosted logo as favicon and the title `Base44 APP`.
- `index.html` references `/manifest.json`, but no `manifest.json` appeared in the tracked Git tree reviewed for this audit.
- No service worker file appeared in the reviewed tracked tree.
- These are migration tasks to verify/fix; this audit did not add a manifest, icon, or service worker.

## 4. Dependency classification

The classification below is for the **current standalone game-route target**, not a request to immediately edit `package.json`.

### 4.1 Keep for the current game/build path

| Package | Evidence / reason |
|---|---|
| `react`, `react-dom` | App and component runtime |
| `react-router-dom` | BrowserRouter, routes, links, navigation, route hooks |
| `framer-motion` | Used by BattleArena and GameModal |
| `lucide-react` | Used by GameIcon and toast UI |
| `@tanstack/react-query` | Current App provider and PageNotFound query; may be reconsidered only after the 404/auth rewrite |
| `@radix-ui/react-toast` | Active Toaster → Toast component chain |
| `class-variance-authority` | Active toast variants |
| `clsx`, `tailwind-merge` | `src/lib/utils.js`, imported by active toast component |
| `tailwindcss` | Main CSS utility framework and Tailwind config |
| `tailwindcss-animate` | Tailwind config plugin; animation utility classes are used by toast styles |
| `postcss`, `autoprefixer` | PostCSS configuration |
| `vite`, `@vitejs/plugin-react` | Vite build/dev configuration |
| `eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-unused-imports`, `globals` | Referenced by ESLint configuration and lint script |
| `typescript` | Referenced by the `typecheck` script |
| `@types/node`, `@types/react`, `@types/react-dom` | Declared for the current typecheck/tooling setup; verify after standalone config cleanup |

### 4.2 Keep temporarily / re-evaluate after auth and 404 decoupling

| Package | Current evidence | Re-evaluation condition |
|---|---|---|
| `@base44/sdk` | Imported by Base44 client and app-params; auth modules and auth pages depend on these | Remove only after replacing auth/app-params/Base44 API call sites |
| `@base44/vite-plugin` | Registered in `vite.config.js` | Remove when standalone Vite config no longer needs Base44 proxy/editor features |
| `@tanstack/react-query` | Provider in App; `PageNotFound.jsx` uses `useQuery` for Base44 user lookup | Can be removed if 404 becomes local-only and no other active query usage remains |
| `@radix-ui/react-toast` | Active toast implementation | Keep unless the toast implementation is replaced |
| `class-variance-authority` | Active toast component; also many orphan UI wrappers | Keep while active toast uses it |

### 4.3 Removal candidates for a minimal current-game build

These packages did not show a direct import from the active game route dependency chain or a required reference in the reviewed root build configuration. Some are referenced by unreferenced UI wrappers or inactive auth pages. Removal should be paired with a decision to drop/preserve those files and followed by a real build.

**Base44/auth-specific candidates after the auth decoupling step**
- `@base44/sdk`
- `@base44/vite-plugin`

**Inactive UI wrapper / auth page dependency candidates**
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`
- `@hello-pangea/dnd`
- `@hookform/resolvers`
- `cmdk`
- `embla-carousel-react`
- `input-otp`
- `next-themes`
- `react-day-picker`
- `react-hook-form`
- `react-resizable-panels`
- `sonner`
- `vaul`
- `zod`

**Other declared dependencies with no direct source/config import found in the reviewed scan**
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`
- `canvas-confetti`
- `date-fns`
- `html2canvas`
- `jspdf`
- `lodash`
- `moment`
- `react-hot-toast`
- `react-leaflet`
- `react-markdown`
- `react-quill-new`
- `recharts`
- `three`

**Development dependency candidate**
- `nitro`: no usage was found in the reviewed scripts/configuration/source files. Recheck any deployment/build environment convention before removal.

### 4.4 Retain if preserving the full UI wrapper library

If the intention is to retain all generated `src/components/ui/*` wrappers for later reuse, do not remove the package candidates in section 4.3 just because the current game routes do not reach them. For example, the wrappers reference Radix primitives, `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`, `input-otp`, `sonner`, and `next-themes`.

## 5. Standalone migration implementation order

1. **Decouple the app root:** replace the Base44 auth-gated `AuthenticatedApp` flow with direct local game routing while retaining `GameProvider`, `QueryClientProvider` only if still needed, `Router`, `ScrollToTop`, and the active toast provider as appropriate.
2. **Replace the 404 page:** remove the `base44.auth.me()` call from `PageNotFound.jsx` and make it a local 404 page.
3. **Remove Base44 Vite integration:** update Vite configuration only after confirming no Base44 proxy/editor behavior is required by the standalone target.
4. **Retire auth-only code:** remove or isolate the Base44 auth pages, auth context, MFA, app params, and SDK client only after checking remaining references.
5. **Decide UI library scope:** keep the full UI wrapper library and dependencies, or intentionally reduce it to the components used by the game.
6. **Clean package.json:** remove only the dependencies proven unnecessary for the selected scope.
7. **Restore standalone branding/PWA assets:** title, favicon, manifest, icons, and service worker decision.
8. **Validate in a real Node environment:** install, lint, build, preview, test all seven routes, verify localStorage save/load and existing v20 save compatibility.

## 6. Explicit non-actions and verification status

- No source code was modified by this audit.
- No dependency was added or removed.
- No package manifest or Vite configuration was changed.
- No game data, save key, or save schema was changed.
- No merge to `main` was performed.
- `npm install`, `npm run lint`, `npm run build`, browser smoke tests, and PWA installation tests were **not run** in this GitHub-only static review environment.

## 7. Conclusion

The source scan is now broad enough to define a safe implementation plan. The main migration blocker is not the game engine or local save layer; it is the Base44 authentication/platform wrapper around the app entry and the Base44-dependent 404 route. The dependency list can be reduced substantially, but only after deciding whether the standalone version preserves the unused generated UI component library.
