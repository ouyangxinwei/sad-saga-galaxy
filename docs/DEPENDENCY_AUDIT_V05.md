# Standalone Migration & PWA Audit V05

> Branch: `standalone-migration`  
> Scope: final retirement of the Base44 account boundary, no-login route verification, v20 local-save compatibility review, product branding, and initial PWA/offline implementation.  
> Save compatibility policy: preserve `saga_galaxy_save_v20` and schema version 20.  
> Branch policy: no changes to `main`.

## 1. Changelog

- **V01** — Initial migration audit and identification of the Base44 integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, UI wrappers, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the standalone app entry, dormant Base44 auth/MFA/OAuth subsystem, User metadata, SDK/API references, and local save path. Classified removal candidates and retained game-critical local functionality.
- **V05** — Retired the dormant Base44 authentication/MFA/OAuth files and Base44 SDK/Vite packages; removed Base44 project metadata; renamed the package and README to `oooo app`; replaced the Base44 favicon/title; verified the seven game routes are directly registered without an auth guard; rechecked the v20 localStorage key/schema; added a standalone PWA manifest, custom SVG icons, scoped service-worker registration, offline navigation fallback, runtime asset caching, and first-install precaching of Vite JS/CSS bundles.

## 2. Base44 and authentication cleanup

The current application source tree no longer contains Base44 SDK/API/authentication modules or dormant auth pages. The tracked tree no longer contains files or paths matching Base44/auth/login/register/OAuth/MFA names. Historical audit documents retain the term Base44 as migration history and are intentionally not rewritten.

Removed in the preceding cleanup commits:
- Login, Register, ForgotPassword, ResetPassword, OAuthConsent pages.
- AuthLayout, GoogleIcon, ProtectedRoute, UserNotRegisteredError components.
- AuthContext, authMfa, authReturnTo, app-params helpers.
- Base44 API client and Base44 User/config metadata.
- `@base44/sdk` and `@base44/vite-plugin` dependencies.

The current `src/App.jsx` imports no auth provider, auth hook, protected route, or Base44 client. No account registration, login, or remote auth server is required by the current app entry.

## 3. Direct route entry review

The app registers these seven game routes directly under `HashRouter`:
- `/` — Home
- `/stages` — Stages
- `/battle` — Battle
- `/formation` — Formation
- `/synthesis` — Synthesis
- `/forge` — Forge
- `/settings` — Settings

A local `*` route renders `PageNotFound`. No authentication wrapper or redirect is present in the route table.

**Verification boundary:** this is a static route/import review. It confirms the current source has no login gate on these routes; it is not a manual browser click-through test of every page.

## 4. Existing v20 save compatibility

Reviewed `src/lib/save.js` and `src/lib/GameContext.jsx` after the auth cleanup and PWA changes.

- Storage key: `saga_galaxy_save_v20`
- Default save `version`: `20`
- Read path: `localStorage.getItem(SAVE_KEY)`, JSON parse, merge with default-state fields.
- Write path: `localStorage.setItem(SAVE_KEY, JSON.stringify(state))`.
- Delete path: `localStorage.removeItem(SAVE_KEY)`.
- GameProvider initializes from `loadState` and persists state changes through `persist(state)`.

No save key, schema, serialization, migration, or game-state code was changed in this work.

**Verification boundary:** source-level compatibility was checked. An actual pre-existing browser save was not injected into a browser and round-tripped in this audit environment; therefore runtime save restoration and persistence still require a browser regression check. Users should not clear site data while testing.

## 5. Branding and app metadata

- HTML title: `oooo app`.
- Application name: `oooo app`.
- Package name: `oooo-app`.
- Favicon: local `oooo-icon.svg`; no external Base44 logo URL.
- README: rewritten for local standalone development and GitHub Pages deployment.
- Removed the previous stale manifest reference during branding cleanup; restored it as a valid local `manifest.webmanifest` link as part of the PWA implementation.

## 6. PWA and offline implementation

Added:
- `public/manifest.webmanifest` — app name, short name, scope, start URL, standalone display, theme/background colors, and 192/512 SVG icons.
- `public/oooo-icon-192.svg` and `public/oooo-icon-512.svg` — local PWA icons.
- `public/sw.js` — scoped service worker.
- `src/main.jsx` — registers the service worker only in production, using Vite's `BASE_URL` so GitHub Pages project paths are respected.
- `index.html` — links the manifest and declares app/theme metadata.

Service worker behavior:
- Precaches the app shell, manifest, and local icons during installation.
- Reads the built HTML and precaches the generated JS/CSS bundle URLs, so the first offline reload does not depend on assets that were never cached.
- Uses network-first navigation with cached `index.html` fallback.
- Uses cache-first for previously cached same-origin GET assets and stores successful same-scope responses for later offline use.
- Deletes older caches under its own cache prefix on activation.
- Does not intercept non-GET requests or cross-origin requests.

**Verification boundary:** implementation is committed, but offline install/launch, browser storage, and cross-browser PWA behavior still require browser/device testing. SVG manifest icons are supplied; if a target platform rejects SVG icons for installation, add PNG variants in a follow-up.

## 7. Build and deployment validation

The earlier Base44 package-removal commit `a44735d33a3c693539f5a1c299c0f1dff87c6b15` completed GitHub Actions run #30 successfully, including build and deploy.

The V05 implementation changed the HTML entry, package name, README, app bootstrap, manifest, icons, and service worker. A new GitHub Actions run is required for this exact final tree. Its status must be checked before describing the V05 build or deployment as successful.

## 8. Explicit non-actions and risks

- No merge to `main`.
- No change to game rules, battle calculations, character data, or the seven game route components.
- No change to `saga_galaxy_save_v20` or schema version 20.
- No account/auth server replacement was added because the product is intentionally local and account-free.
- No Base44 SDK/API calls remain in the current app source path.
- Third-party UI/game dependencies were not broadly removed as part of this task.
- Browser-based route, old-save round-trip, installability, and offline regression testing remain outstanding.

## 9. Conclusion

The current branch source is configured as a local, account-free single-player game named **oooo app**, with the original v20 local save contract preserved. The PWA manifest and service worker are implemented with GitHub Pages subpath awareness and offline app-shell caching. Production build/deploy and real-browser regression checks must be confirmed separately before calling the migration fully verified.
