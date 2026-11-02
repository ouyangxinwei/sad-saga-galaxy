# 30-Day Test Resource Support V13

> Branch: `standalone-migration`  
> App release: `v0.24`  
> Release date: 2026-11-03  
> Canonical game URL: https://ouyangxinwei.github.io/sad-saga-galaxy/

## 1. User guide

- On the first V13 launch, the current browser-local save receives **450 summon tickets** and **324,000 gems** once. The grant is additive; existing balances and progression are retained.
- The 30-day period starts at the first successful grant, not the release date.
- Open **Settings** to see current ticket/gem/stamina balances and the remaining support period.
- During the 30-day period, use **Free refill stamina to 60** in Settings. It costs no gems and is unavailable when stamina is already full.
- After 30 days, free refill is disabled. Normal stamina regeneration and shop rules continue. Remaining resources and all game progress are retained.

## 2. Resource budget

| Resource | Amount | Planning basis |
|---|---:|---|
| Summon tickets | 450 | One 10-pull/day × 30 days × 1.5 buffer |
| Gems for relic forging | 279,000 | All six relics once/day; 6,200 gems/day × 30 × 1.5 |
| Gems for stamina purchases | 45,000 | Ten 100-gem purchases/day × 30 × 1.5 |
| **Total gems** | **324,000** | Combined forging and stamina budget |

These are test allowances based on the agreed estimated cadence, not changes to normal game economy. Summon behavior, pity, relic costs, shop prices, battle costs, and progression rules are unchanged.

## 3. Technical implementation

- Existing save key remains `saga_galaxy_save_v20`; save schema remains version `20`.
- The separate localStorage marker is `oooo_v13_test_support_v1`, containing `claimedAt`, `expiresAt`, and grant amounts.
- The grant is added to the existing state and written using the existing `persist()` function. That function returns a boolean; the marker is rolled back if persistence fails.
- The marker prevents duplicate grants on refresh/reopen. The grant applies to a pre-existing local save upgraded to V13 and to a fresh local save in a browser profile that has not claimed it.
- Free refill checks expiry again when clicked, sets stamina to `STAMINA_MAX`, and resets `staminaAt` to the current time.
- The in-game reset does not clear the V13 marker, so resetting the same browser profile does not grant a second allowance.
- This app has no server account: “existing/new save” means a local browser profile. Clearing site data removes both save and marker; a new profile can claim once. Copying only the save to another browser does not transfer the marker. The timer uses the device clock.

## 4. Files changed

- `src/lib/GameContext.jsx` — one-time local grant, 30-day validity and free stamina refill action.
- `src/pages/Settings.jsx` — test-support status, balances and refill control.
- `src/lib/i18n.js` — Chinese/Japanese/English labels and notices.
- `src/lib/version.js` — app version and localized V13 release notes.
- `package.json` — package version `0.24.0`.
- `public/sw.js` — PWA shell cache namespace `v5`.

## 5. Cumulative changelog V01–V13

- **V01** — Initial migration audit and identification of the Base44 integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, UI wrappers, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the standalone app entry, dormant Base44 auth/MFA/OAuth subsystem, User metadata, SDK/API references, and local save path. Classified removal candidates and retained game-critical local functionality.
- **V05** — Retired dormant Base44 authentication/MFA/OAuth files and Base44 SDK/Vite packages; removed Base44 project metadata; renamed package and README to `oooo app`; replaced Base44 favicon/title; reviewed seven routes and v20 save contract; added PWA manifest, custom SVG icons, scoped service-worker registration, offline navigation fallback, runtime asset caching, and bundle precaching.
- **V06** — Verified the production Actions build/deployment and reviewed seven route definitions and residual Base44 integration references. Browser Console/Network and manual route interaction remained unverified.
- **V07** — Deferred real-browser v20 legacy-save read/write testing by user instruction. Existing local save key/schema and game logic were left unchanged; cloud save is a separate future design item.
- **V08** — Reviewed PWA manifest and service-worker behavior; changed favicon and manifest references to Vite's `%BASE_URL%` token; documented installation/offline test procedures and remaining real-device validation items.
- **V09** — Performed a source-level gameplay regression review of seven routes, main navigation, formation, synthesis, forge, battle simulation/rewards, settings persistence path, and responsive layout classes. Added a repeatable manual test matrix; actual browser interactions remain pending.
- **V10** — Moved shared game modals to a document-level portal to escape the AppShell stacking context and reliably layer above fixed bottom navigation; added dynamic viewport-height constraints, safe-area padding, non-shrinking header, and contained modal-body scrolling. No game logic or save behavior changed.
- **V11** — Centralized the in-app release version; synchronized the home version button, settings version label, and release-history header; added Chinese/Japanese/English release notes; added a pre-build validator for package/app version and translation completeness; bumped the PWA cache namespace.
- **V12** — Replaced per-battle temporary speed state with one browser-local shared preference; speed now carries across stages, retries, supported modes, refreshes, and relaunches. Changes remain immediate; default is 1x and the existing 1x/2x/3x cycle is retained.
- **V13** — Added a one-time local grant of 450 summon tickets and 324,000 gems for a 30-day test period; added free one-tap stamina refill to 60 during the period; after expiry, remaining resources and progression are retained and normal stamina/shop rules resume; preserved save key/schema version 20.

## 6. Validation checklist

**Build/source checks**
- [ ] `npm run validate:version` passes.
- [ ] `npm run build` passes.
- [ ] V13 release notes are complete in zh/ja/en.
- [ ] App version `v0.24`, package version `0.24.0`, service-worker cache `v5`.
- [ ] Save key and schema version remain unchanged.

**Browser/device checks still required**
- [ ] Existing local save receives exactly one additive grant and keeps its progress.
- [ ] Refresh/reopen does not duplicate the grant.
- [ ] Fresh browser profile receives the grant once.
- [ ] Settings shows balances and remaining days.
- [ ] Refill below 60 restores to 60 without spending gems.
- [ ] Refill is unavailable at 60 and after expiry.
- [ ] After expiry, leftover resources/progression remain and normal shop/recovery work.
- [ ] Android Chrome/PWA and desktop browser update behavior verified.

No real-browser/device interaction test is claimed until these checks are actually performed.

## 7. Deployment and PWA update

All V13 commits are restricted to `standalone-migration`; `main` is not modified. GitHub Actions build and Pages deployment must succeed before V13 is described as live. After deployment, reopen/reload the installed PWA so cache namespace `oooo-app-shell-v5` can take over. If the app still shows the previous release, close all app windows and reopen; avoid clearing site data unless intentionally resetting the local save and marker.

## 8. Compatibility boundaries

- No login, registration, account server, cloud save, or dependency was added.
- No game save key/schema, summon probability, pity, ticket cost, relic price, stamina shop price, battle cost, or battle calculation was changed.
- No existing progression, cards, equipment, or resources are cleared by expiry.
