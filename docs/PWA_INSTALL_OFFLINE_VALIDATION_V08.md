# PWA Installation and Offline Validation V08

> Branch: `standalone-migration`  
> Scope: PWA manifest, asset paths, service-worker cache strategy, desktop/mobile installation checklist, and offline validation boundaries.  
> Save handling: legacy v20 local save testing is deferred by user instruction. No save key, schema, or game logic changes are included.

## 1. Changelog (preserved history)

- **V01** — Initial migration audit and identification of the oooo integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, UI wrappers, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the standalone app entry, dormant oooo auth/MFA/OAuth subsystem, User metadata, SDK/API references, and local save path. Classified removal candidates and retained game-critical local functionality.
- **V05** — Retired dormant oooo authentication/MFA/OAuth files and oooo SDK/Vite packages; removed oooo project metadata; renamed package and README to `oooo app`; replaced oooo favicon/title; reviewed seven routes and v20 save contract; added PWA manifest, custom SVG icons, scoped service-worker registration, offline navigation fallback, runtime asset caching, and bundle precaching.
- **V06** — Verified the production Actions build/deployment and reviewed seven route definitions and residual oooo integration references. Browser Console/Network and manual route interaction remained unverified.
- **V07** — The proposed real-browser v20 legacy-save read/write test was deferred by user instruction. Existing local save key/schema and game logic were left unchanged; cloud save is a separate future design item.
- **V08** — Reviewed PWA manifest and service-worker behavior; changed favicon and manifest references in `index.html` to Vite's `%BASE_URL%` token so GitHub Pages project-site paths are handled explicitly; documented installation/offline test procedures and the remaining real-device validation items.

## 2. PWA configuration review

| Item | Current configuration | Static review |
|---|---|---|
| App name | `oooo app` | PASS |
| Short name | `oooo` | PASS |
| Display mode | `standalone` | PASS |
| Start URL / scope | `./` | PASS |
| Theme/background | `#101426` | PASS |
| Manifest icons | SVG 192 and 512 entries | Present; install rendering still needs device verification |
| Service worker | Registered only in production under `import.meta.env.BASE_URL` | PASS |
| GitHub Pages base path | `/sad-saga-galaxy/` | Explicitly used by Vite |
| Manifest/favicon links | `%BASE_URL%` in HTML | Updated in V08 |

The manifest declares the display name and the two SVG icon entries. This confirms the configuration values, not the appearance of the installed shortcut or whether every browser/device version accepts the SVG icons for its install surface. If a target device does not show the expected icon or install option, add PNG 192x192 and 512x512 icon assets as a compatibility follow-up.

## 3. Service-worker source review

The current `public/sw.js` implements:

1. A versioned cache namespace: `oooo-app-shell-v2`.
2. Install-time precaching of the service-worker scope URL, `index.html`, manifest, and three SVG icon files.
3. Extraction of built JavaScript and CSS asset URLs from the cached production HTML, followed by precaching those bundles.
4. Activation-time deletion of older caches beginning with `oooo-app-shell-`, followed by `clients.claim()`.
5. Same-origin, in-scope GET request handling with cache-first lookup and runtime caching for successful basic responses.
6. Network-first navigation with cached `index.html` / scope fallback when offline.

Because the application uses hash-based routes, the seven game pages share the same HTML application shell. Once the shell and required bundles are cached, offline navigation to the hash routes should be possible. This is a source-based expectation, not a completed offline browser test.

## 4. Required real-browser test matrix

No Chrome, Edge, or Android installation/offline test is marked PASS in this report. Complete the following against the deployed URL after the latest Pages deployment finishes.

### Desktop Chrome

- [ ] Open the deployed app over HTTPS.
- [ ] Confirm the browser offers Install (or the install icon in the address bar/menu).
- [ ] Install and launch the standalone window.
- [ ] Confirm the installed app name is `oooo app` and the icon is the custom star icon.
- [ ] Open all seven routes: `/#/`, `/#/stages`, `/#/battle`, `/#/formation`, `/#/synthesis`, `/#/forge`, `/#/settings`.
- [ ] With the app loaded once online, disable network and restart the installed app.
- [ ] Confirm each of the seven routes renders without a network connection.
- [ ] Re-enable network, reload, and confirm the app remains usable.

### Desktop Edge

- [ ] Repeat the install, app name/icon, seven-route, and offline-restart checks in Edge.
- [ ] Confirm no install prompt or service-worker errors appear in DevTools Console.

### Android Chrome

- [ ] Open the deployed HTTPS URL in Chrome.
- [ ] Use Chrome's Install app / Add to Home screen action.
- [ ] Confirm the home-screen name is `oooo` or the browser's expected short-name presentation, and inspect the icon.
- [ ] Launch from the home screen and confirm standalone display.
- [ ] Load the app once online, enable airplane mode, fully close and relaunch it.
- [ ] Confirm all seven hash routes work offline.
- [ ] Reconnect and verify the app can load the latest deployed version.

### Cache and update behavior

- [ ] In DevTools > Application > Service Workers, confirm the worker is registered and activated for the project-site scope.
- [ ] In Application > Cache Storage, confirm the `oooo-app-shell-v2` cache contains the shell, manifest, icons, and built JS/CSS bundles.
- [ ] Confirm an offline navigation receives the cached app shell.
- [ ] Deploy a subsequent build, reconnect, reload, and verify the new build becomes available.
- [ ] Confirm old cache namespaces are removed when a new service-worker version activates.
- [ ] Check Console and Network for failed asset requests, unexpected cross-origin requests, and service-worker install/update errors.

## 5. Important interpretation notes

- A successful GitHub Actions build does not prove that browser installation or offline startup works.
- The source currently uses SVG manifest icons. If Chrome/Edge/Android does not offer installation or displays a generic icon, test with PNG 192x192 and 512x512 icons before changing unrelated app code.
- The current service worker is scoped to the GitHub Pages project path. Do not test using the repository root URL; use the deployed project-site URL.
- The service worker precaches the bundles referenced by the generated production HTML. The actual generated HTML and Cache Storage contents still need inspection in a real browser.
- Do not clear browser site data or delete the existing local save during these tests. The save contract is intentionally outside V08.

## 6. Save and cloud direction

The current local save key remains `saga_galaxy_save_v20`, with the existing version 20 structure. V08 makes no changes to it. Cloud save should be designed as a separate future feature, including account identity, synchronization policy, conflict resolution, backup/restore, and privacy/security decisions. No login, registration, or cloud API is introduced by this V08 work.

## 7. V08 result

- **PWA manifest/name/display configuration:** PASS (static source review).
- **GitHub Pages base-path references:** UPDATED to use `%BASE_URL%`; production output still needs verification.
- **Service-worker source strategy:** PASS (static source review).
- **Chrome / Edge installation:** NOT RUN (real browser required).
- **Android home-screen installation:** NOT RUN (real Android device required).
- **Offline restart and seven-route navigation:** NOT RUN.
- **Cache contents and update lifecycle:** NOT RUN in browser DevTools.
- **v20 save read/write validation:** DEFERRED by user instruction; save key/schema untouched.

V08 is therefore a configuration review and test-preparation milestone, not a completed real-device PWA certification.
