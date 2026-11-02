# Global Battle Speed Preference V12

> Branch: `standalone-migration`  
> App release: `v0.23`  
> Release date: 2026-11-03  
> Scope: share and persist the battle animation speed across stages and supported battle modes.

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
