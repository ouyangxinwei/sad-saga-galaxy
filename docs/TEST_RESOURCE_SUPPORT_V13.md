# 30-Day Test Resource Support V13

> Branch: `standalone-migration`  
> App release: `v0.24`  
> Release date: 2026-11-03  
> Scope: provide a one-time local test resource grant and temporary free stamina refill for a 30-day test window.

## 1. Changelog (preserved history)

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
- **V13** — Added a one-time automatic grant of 450 summon tickets and 324,000 gems for existing and new local saves; starts a 30-day test window on first grant; adds free one-tap stamina refill to 60 during the window; after expiry, normal stamina/shop rules resume while remaining resources and all progression are retained. Keeps the original `saga_galaxy_save_v20` key and schema version 20.

## 2. Implementation

- `src/components/battle/BattleArena.jsx` reads the shared speed from the independent localStorage key `oooo_battle_speed_v1`.
- The accepted values are 1, 2, and 3. Invalid or unavailable stored values fall back to 1.
- Changing the speed updates the current battle timer immediately and writes the preference for the next battle.
- Because every stage and supported battle mode uses the same BattleArena component, the preference carries over without separate per-stage configuration.
- `src/lib/version.js` and `package.json` are advanced to `v0.23` / `0.23.0`; release notes are provided in Chinese, Japanese, and English.
- Service-worker cache namespace advances to `oooo-app-shell-v4`.

## 3. Validation plan

- Build-time version/localization validator remains part of `npm run build`.
- Verify 1x → 2x → 3x → 1x cycling.
- Change speed during a battle and confirm the current battle pace changes without restarting.
- Finish a stage and enter the next stage; confirm the selected speed remains.
- Retry the same stage and enter another supported mode; confirm the same speed remains.
- Refresh/reopen the app and confirm the setting remains.
- Confirm an invalid/missing local setting defaults to 1x.
- Real-browser/device interaction tests are not claimed unless separately performed.

## 4. Compatibility and boundaries

- Existing game save key remains `saga_galaxy_save_v20`.
- Existing save schema remains version 20.
- The speed preference is stored separately and does not modify the game save.
- Battle simulation, damage, rewards, stamina costs, and progression rules are unchanged.
- No dependencies added; no account or cloud storage introduced.

## 5. Release rule

Continue updating the centralized app version, package version, all three localized release notes, full version history, and PWA cache namespace for each relevant release. Do not call the new version live until its GitHub Actions deployment succeeds.

## 2. V13 test resource budget

The grant is a suggested test budget derived from the agreed 30-day cadence and 1.5x buffer:

| Purpose | Planning assumption | 30-day × 1.5 budget |
|---|---:|---:|
| Recruitment tickets | One 10-pull per day | 450 tickets |
| Relic forging gems | All six relics once per day; total cost 6,200 gems/day | 279,000 gems |
| Gem stamina purchases | Ten 100-gem purchases per day | 45,000 gems |
| **Total** | | **324,000 gems + 450 tickets** |

These are test allowances, not changes to the game's economy. Existing relic prices, ticket shop price (80 gems), stamina shop price (100 gems for 20 stamina), summon behavior, and crafting behavior remain unchanged.

## 3. V13 implementation

- `src/lib/GameContext.jsx` defines the V13 local test grant and 30-day window.
- The grant is automatically applied once when the provider starts without a V13 claim marker. This covers both a pre-existing local save upgraded to V13 and a newly initialized local save.
- The resource grant is additive: **+450 tickets** and **+324,000 gems**. Existing resources are not overwritten.
- The separate localStorage marker is `oooo_v13_test_support_v1`; it records `claimedAt`, `expiresAt`, and grant amounts. It prevents a refresh/reopen from granting the resources again.
- The original game save remains `saga_galaxy_save_v20`; schema version remains `20`. `persist()` now returns a success boolean so the marker is not retained when the initial grant cannot be saved.
- `Settings` shows the test support status, remaining days, current ticket/gem/stamina balances, and the free refill action.
- Free refill sets stamina to 60 and resets `staminaAt` to the refill time, avoiding an unintended extra natural-regeneration burst.
- After expiry, the refill action is disabled and the normal natural recovery and gem shop remain unchanged. No resources are removed and no progress is reset.
- App version advances to `v0.24`, package version to `0.24.0`, and the service-worker cache namespace to `oooo-app-shell-v5`.

## 4. User guide

1. Open the updated game in the same browser profile used for the existing local save.
2. On the first V13 launch, the grant is applied automatically; no claim button is required.
3. Open **Settings** to confirm the resource balances and 30-day status.
4. While the test period is active, use **Free refill stamina to 60** whenever stamina is below the cap.
5. Continue using recruitment, forging, and the regular shop normally. The grant does not change their prices or rules.
6. After 30 days, free refill becomes unavailable. Remaining tickets/gems and all game progress stay in the save.

## 5. Local-only scope and limitations

- This is a standalone single-player app. “Existing account” means the existing save in the current browser's local site storage; there is no server account or cross-device identity.
- The grant marker is stored separately from the original save. Clearing all site data removes both the local save and marker; a later fresh profile can receive a new local grant.
- Copying/importing a save into another browser profile does not transfer the marker. Do not use site-data clearing or profile cloning as a way to repeat the test grant.
- The 30-day timer is based on the device clock. Changing the device clock can affect the apparent expiry.
- Resetting the in-game save does not clear the V13 grant marker and does not reissue the grant.
- If localStorage is unavailable or quota-blocked, the grant is not considered complete; the marker is rolled back when possible.

## 6. Validation checklist

- Build validator confirms app/package version consistency and complete zh/ja/en release notes.
- Existing save upgrade: confirm balances increase by exactly 450 tickets and 324,000 gems once.
- New local save: confirm the same one-time grant.
- Refresh and reopen: confirm no duplicate grant.
- Check stamina below 60: free refill restores exactly to 60 without gem deduction.
- Check stamina already at 60: refill does not alter resources.
- Simulate expiry in a test profile: confirm free refill is disabled, regular recovery/shop behavior remains, and balances/progress are retained.
- Verify `saga_galaxy_save_v20` and schema version `20` remain unchanged.
- Actual browser/device interaction tests are not claimed unless separately performed.

## 7. Compatibility boundaries

- No login, registration, server account, cloud save, or external service was introduced.
- No summon probability, pity, ticket cost, relic price, stamina purchase price, battle cost, or battle calculation was changed.
- No progression, card collection, equipment, or existing save fields are reset.
- The test grant is additive and local to the browser profile.

## 8. Release rule

Do not call V13 live until the `standalone-migration` GitHub Actions build and Pages deployment have completed successfully. The canonical game URL is https://ouyangxinwei.github.io/sad-saga-galaxy/; until deployment succeeds it may still serve the previous release.