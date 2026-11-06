# oooo Dependency Audit V04

> Branch: `standalone-migration`  
> Audit baseline: `dac2268a050117a2e7fbd08360df04828462af3f`  
> Scope: remaining oooo SDK/platform, authentication, user/role, API, cloud-data, and save-data dependencies.  
> Change policy: audit/documentation only; no application source, package manifest, runtime configuration, or game data changed.

## 1. Changelog

- **V01** — Initial migration audit and identification of the oooo integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, all 53 UI wrapper files, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the current `standalone-migration` head after the app-entry migration. Focused review of the remaining oooo client, app parameters, auth context/MFA, dormant auth pages, OAuth consent API, user entity metadata, active game routes, GameContext, and local save implementation. Added a functional classification of direct removal candidates, replacement-required integrations, and game-critical local functionality. Documentation only.

## 2. Scope and method

The branch head was confirmed as `dac2268a050117a2e7fbd08360df04828462af3f`. The repository tree contains 120 tracked files under `src/` (the same source inventory recorded by V03).

This audit combines:
- The V03 inventory and static import-graph findings for all 120 tracked source files.
- Direct file-level review of the current app entry, oooo client and app-parameter modules, AuthContext, MFA helpers, auth layout/route/error components, Login/Register/ForgotPassword/ResetPassword/OAuthConsent pages, GameContext, save module, active game routes, package manifest, Vite config, index.html, and oooo User entity metadata.
- Targeted searches in the reviewed source for oooo SDK/API references, auth/OAuth/login/logout/register/user/token/role/permission patterns, HTTP calls, local/session storage, and cloud/sync terminology.

**Limitations:** this remains a static source audit, not a parser-generated exhaustive call graph or runtime network trace. V03's full 120-file inventory is reused as the broad source baseline; V04's direct line-by-line follow-up concentrates on the oooo/auth/data boundary. Dynamic imports, indirect package behavior, server-side behavior, and endpoints not exercised by source code cannot be ruled out. No live oooo account or server was queried. No npm install, lint, build, browser test, or network interception was run as part of this documentation-only audit.

## 3. Current standalone game path

The current `src/App.jsx` mounts:
- `QueryClientProvider`
- `GameProvider`
- `HashRouter`
- `ScrollToTop`
- `Toaster`

The registered routes are the seven game routes:
- `/` → Home
- `/stages` → Stages
- `/battle` → Battle
- `/formation` → Formation
- `/synthesis` → Synthesis
- `/forge` → Forge
- `/settings` → Settings
- `*` → local `PageNotFound`

The current app entry no longer imports `AuthProvider`, `AuthContext`, `ProtectedRoute`, or oooo client code. The game provider and active game route modules are local application code.

## 4. Remaining oooo integration inventory

### 4.1 SDK client and app bootstrap parameters

| File | Remaining behavior | Current active-path status |
|---|---|---|
| `src/api/ooooClient.js` | Imports `createClient` from `@oooo/sdk`; creates the oooo client from app parameters | Not imported by current `App.jsx`; still imported by dormant auth/MFA modules |
| `src/lib/app-params.js` | Imports `getAccessToken`; reads `VITE_oooo_APP_ID`, `VITE_oooo_FUNCTIONS_VERSION`, `VITE_oooo_APP_BASE_URL`; reads/clears `oooo_access_token` and `token` in localStorage; reads URL bootstrap parameters | Not imported by the current game route tree; used by dormant auth/MFA and OAuth consent code |
| `src/lib/AuthContext.jsx` | Calls `oooo.app.getPublicSettings()`, `oooo.auth.me()`, `oooo.auth.logout()`, `oooo.auth.redirectToLogin()`; maintains user/auth/loading/error/public-settings state | Not mounted by current App; legacy auth infrastructure |
| `src/lib/authMfa.js` | Calls oooo app auth endpoints; writes SDK token; supports email/password MFA and social provider login | Not imported by current game route tree; legacy auth flow |
| `src/lib/authReturnTo.js` | Sanitizes same-origin post-login return URL and strips auth bootstrap parameters | Used by dormant Login/Register flows; not a game runtime dependency |

### 4.2 Dormant authentication pages and components

The following files remain tracked but are not registered in the current `src/App.jsx` route table:
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/ResetPassword.jsx`
- `src/pages/OAuthConsent.jsx`
- `src/components/AuthLayout.jsx`
- `src/components/GoogleIcon.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/UserNotRegisteredError.jsx`
- `src/lib/AuthContext.jsx`
- `src/lib/authMfa.js`
- `src/lib/authReturnTo.js`

The auth pages call SDK operations for email/password login, Google login, registration, OTP verification/resend, password reset request, and password reset. `ProtectedRoute` consumes `useAuth`; `UserNotRegisteredError` presents a platform registration/access error. These files represent a dormant but still oooo-coupled authentication subsystem, not proof that the seven game routes require an account.

### 4.3 OAuth consent and MCP platform integration

`src/pages/OAuthConsent.jsx` is more than a generic local consent screen. It:
- Reads a server-issued `ctx` handle from the URL.
- Calls `/api/apps/{appId}/mcp/consent-info` with cookie credentials and an optional Bearer token.
- Uses the server's `authenticated` result and configured `login_path` to resume a login flow.
- Posts approve/deny decisions to `/api/apps/{appId}/mcp/authorize-grant`.
- Handles server responses for expired/consumed handles and redirects to the AI client.

This is a oooo-hosted MCP/OAuth consent flow. It is not registered in the current app route table and is not used by the current game path. It must not be mistaken for game data access. If MCP/OAuth functionality is intentionally retained in the standalone product, it requires a separately designed replacement backend and security model; it cannot be made standalone by simply deleting the SDK.

### 4.4 oooo server endpoints

`src/lib/authMfa.js` directly calls:
- `/api/apps/{appId}/auth/{suffix}` (including login and MFA handoff)
- `/api/apps/public/login-info/by-id/{appId}`

These are platform API endpoints, not local game APIs.

`src/pages/OAuthConsent.jsx` directly calls the MCP consent-info and authorize-grant endpoints described above.

No direct oooo entity CRUD or game-state cloud persistence call was identified in the reviewed active game path. The above endpoint calls belong to dormant account/MFA/MCP features.

### 4.5 User, role, permission, and account data

- `oooo/entities/User.jsonc` declares a oooo User entity with a `role` field whose enum is `admin` or `user`.
- The current game `App.jsx` does not mount an auth provider or protected route and the seven registered game pages do not show a current login/role gate in the reviewed active path.
- The legacy auth subsystem still contains user identity, authentication state, registration state, and access-denied handling.
- No game feature was found in the reviewed active route path that requires the oooo User entity or role field.

The User entity definition is platform metadata. Its existence alone does not prove the game engine or local saves depend on oooo user records.

## 5. Does the game depend on oooo cloud data?

### Finding: no oooo cloud game-state dependency was identified in the active game path.

Evidence:
- `src/lib/GameContext.jsx` manages game state in the client-side React context. The reviewed file contains game progression/state operations and no oooo SDK import or HTTP request.
- `src/lib/save.js` reads/writes/removes game state through browser `localStorage`.
- The save key remains `saga_galaxy_save_v20`; the save schema remains version 20.
- The current seven game routes use the local game modules/components described in V03.
- The reviewed active game path did not show oooo entity CRUD, oooo functions, or cloud-save synchronization.

**Important distinction:** this finding is limited to the source and active route path reviewed. It does not prove that no platform-hosted analytics, image assets, fonts, or other remote static resources exist anywhere in the repository or in third-party packages. It also does not prove that dormant auth/MCP endpoints are operational or unnecessary to some external workflow.

### Local save behavior to preserve

- Storage: browser `localStorage`
- Key: `saga_galaxy_save_v20`
- Schema: v20

Do not change the key, serialization, migration behavior, or schema during oooo cleanup without a separate explicit approval and save-compatibility plan.

## 6. oooo-related references outside the active game runtime

The repository still contains oooo branding/configuration metadata:
- `oooo/config.jsonc` — oooo project build/serve metadata.
- `oooo/entities/User.jsonc` — oooo User entity schema.
- `index.html` — oooo favicon URL, title `oooo APP`, and `/manifest.json` reference.
- `package.json` — declares `@oooo/sdk` and `@oooo/vite-plugin`.

The current `vite.config.js` no longer registers the oooo Vite plugin; it uses the React plugin, GitHub Pages base path, and local `@` alias. Thus the Vite plugin package is not needed by the current Vite config as reviewed, although the package remains declared.

The `index.html` title/favicon and manifest reference are branding/PWA cleanup items, not evidence of a oooo authentication or game-data dependency. V03 noted that no tracked `manifest.json` or service worker was present in its repository-tree review.

## 7. Functional classification

This classification concerns the current standalone game-route target. It is not an instruction to delete files immediately.

### 7.1 Can be removed directly after reference verification (not game-critical)

| Candidate | Reason | Safety condition |
|---|---|---|
| `src/lib/AuthContext.jsx` | Not mounted by App; provides oooo auth/public-settings state | Confirm no dynamic import or external route uses it |
| `src/components/ProtectedRoute.jsx` | Not used by current route table; depends on AuthContext | Confirm no other import/route uses it |
| `src/components/UserNotRegisteredError.jsx` | Only supports the legacy protected-auth flow in the reviewed graph | Confirm no other import |
| `src/lib/authReturnTo.js` | Used by dormant login/register return flow | Remove together with those auth pages or preserve if a future local auth flow needs safe redirects |
| `src/components/AuthLayout.jsx`, `GoogleIcon.jsx` | Auth-page presentation components | Remove only with the dormant auth pages |
| `oooo/config.jsonc`, `oooo/entities/User.jsonc` | oooo project metadata; not imported by the active Vite game path | Confirm oooo Builder workflow is no longer required for this branch; retain on any branch that still syncs with Builder |
| `@oooo/vite-plugin` | No longer configured in current `vite.config.js` | Confirm no other tooling command loads it before package removal |

### 7.2 Requires replacement or an explicit product decision

| Candidate | Why it cannot be blindly deleted | Required decision/replacement |
|---|---|---|
| `@oooo/sdk` and `src/api/ooooClient.js` | Dormant auth/MFA pages and helpers import it | Remove only after retiring those flows or replacing them with a chosen auth provider |
| `src/lib/app-params.js` | Owns app ID, token acquisition, URL bootstrap parameter and legacy token cleanup behavior | Remove with dependent oooo auth/MCP modules; do not keep token handling without a security design |
| `src/lib/authMfa.js` | Calls oooo auth and login-info endpoints; includes MFA and social login behavior | If account login is wanted, select and implement a replacement identity provider/backend; otherwise retire the feature |
| Login/Register/ForgotPassword/ResetPassword pages | User-facing account features backed by oooo | Decide whether standalone game remains fully local/no-account or needs independent accounts |
| `src/pages/OAuthConsent.jsx` | Implements a server-backed MCP OAuth consent flow with single-use context handles and grants | Retire if MCP integration is out of scope; otherwise build/host a compatible secure backend before removal |
| `oooo/entities/User.jsonc` | Encodes platform role metadata | If admin/user authorization is needed in future, define a new local/backend authorization model; no such active game gate was identified |
| `@tanstack/react-query` and App's QueryClientProvider | V03 identified the old 404 page's oooo user query; current PageNotFound is local, and current game routes showed no query usage in the reviewed graph | Verify no remaining/dynamic query usage, then remove provider/package only if truly unused; this is not itself a oooo SDK dependency |

### 7.3 Must retain for current game functionality

| Item | Reason |
|---|---|
| `src/lib/GameContext.jsx` and game-domain modules | Core local game state and game rules |
| `src/lib/save.js` | Local persistence and save compatibility |
| `saga_galaxy_save_v20` | Existing player save key; preserve |
| Save schema v20 and existing migration/serialization behavior | Preserve existing browser saves |
| `src/App.jsx` game routes, `GameProvider`, `HashRouter`, `Toaster`, and active game components | Current standalone game entry and UI |
| React/Vite/React Router and active game dependencies | Required by the current app/build path as recorded in V03 |

## 8. Recommended next implementation sequence

1. **Confirm product scope:** keep the standalone game local/no-account, or retain user accounts? Keep MCP/OAuth consent? These are separate decisions.
2. If the goal is a fully local game with no account system, retire the dormant login/register/password-reset/MFA/OAuth pages and their helper chain as one coherent unit.
3. Remove unused auth provider/route components and the oooo client/app-parameter modules only after checking every remaining import and dynamic reference.
4. Remove `@oooo/sdk` after its final source import is gone. Remove `@oooo/vite-plugin` after confirming no other tooling loads it.
5. Decide whether to delete oooo project metadata from this branch; keep Builder sync/main untouched.
6. Recheck `@tanstack/react-query` independently; it is a possible unused package/provider after the local 404 change, not a required oooo replacement.
7. Update title/favicon and PWA manifest/service-worker work in a separate task.
8. Run install/lint/build and route/save regression tests. Verify existing v20 local saves remain readable.

## 9. Explicit non-actions and verification status

- No application source code was modified.
- No dependency was added or removed.
- No game logic, character data, battle engine, save key, or save schema was changed.
- No oooo auth/API endpoint was called; this is a source-code audit.
- No oooo account, cloud database, or MCP server was queried.
- No merge to `main` was performed.
- No npm install, lint, build, browser smoke test, network trace, or PWA installation test was run as part of this audit.
- The only intended repository change for V04 is this documentation file.

## 10. Conclusion

The current seven-route game path is already separated from the oooo authentication wrapper and appears to use local React state plus browser localStorage for game progression and saves. The remaining oooo footprint is concentrated in a dormant account/authentication subsystem, MFA/social-login helpers, an MCP OAuth consent page, app bootstrap/token utilities, the oooo SDK package, and repository branding/metadata.

The key decision before implementation is whether the standalone game is intended to be **local and account-free**. If yes, most remaining oooo auth code can be retired as a group without replacing it, while preserving the local game engine and v20 saves. If accounts or MCP/OAuth are required, those features need an explicit replacement backend/provider and security design; simply removing the SDK would break them.
