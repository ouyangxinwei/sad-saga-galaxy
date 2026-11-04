# V7 Phase 6 — Comprehensive Regression & Release Acceptance (V0.52)

Date: 2026-11-04  
Branch: `standalone-migration`  
Previous release: V0.51  
Release: V0.52

## Scope

This phase consolidates regression review for the V7 character progression and save-system work. It does not introduce a broad refactor or change the previously approved gameplay rules.

## Acceptance review

| Area | Acceptance details | Evidence / status |
|---|---|---|
| Character progression | Career-specific growth, character EXP, level cap, stored EXP, breakthrough rewards | Automated character progression suite passed in Actions Run #295 |
| Teamwide bonus | Main character level only; +3% per level; applied once to every deployed member | Dedicated tests cover main-character-only calculation and team HP/MP totals; Run #295 passed |
| Fusion | Strongest full progression record wins; existing result copy remains if it is stronger; consumed and remaining copy records are handled | Fusion and fusion-preview regression tests passed in Run #295 |
| Save system | Full JSON export, import preview, second confirmation, validation and failure protection | Save-backup tests passed in Run #295 |
| Compatibility | Legacy raw V20 save migration and preservation of player progress, resources, equipment and character progression | Legacy migration tests passed in Run #295 |
| Regression | Existing battle/equipment/balance, warning diagnosis, reset, character progression and save tests | Workflow test step passed in Run #295 |
| Mobile | Settings, dialogs, file picker, scrolling and safe-area behavior | Existing responsive/safe-area implementation reviewed; physical-device interaction is not certified by CI |
| PWA | Manifest, Service Worker cache update and offline fallback implementation | Manifest and Service Worker configuration reviewed; real install/offline launch requires target-device verification |
| Release | Version, changelog, documentation, Pages build and deployment | V0.52 release metadata updated; deployment result recorded after the V0.52 workflow completes |

## Automated test evidence before V0.52 release metadata update

GitHub Actions Run #295:
- Run ID: `41760062664`
- Commit: `e14ab944d78302717637ef00985a5739173ccbec`
- Branch: `standalone-migration`
- Build job: success
- Deploy job: success
- Production artifact: uploaded successfully

Run #295 verified the V0.51 source state. The V0.52 metadata/cache/documentation commit triggers a new workflow; its result must be checked separately before declaring V0.52 deployed.

## PWA cache

The Service Worker cache key is advanced from `oooo-app-shell-v33` to `oooo-app-shell-v34` so an updated client can replace the previous app shell and remove older prefixed caches during activation.

## Manual verification boundary

The following cannot be honestly certified from a GitHub Actions result alone:
- Installing the PWA from a real mobile browser.
- Relaunching the installed app after the cache update.
- Launching while offline on a target device.
- Touch interaction, file picker behavior, safe-area layout and scroll behavior across actual device/browser combinations.

These items remain device-level checks. The code release and Pages deployment can be successful while these manual checks remain pending.

## Release invariants

- Keep development and deployment on `standalone-migration`; do not modify `main`.
- Preserve existing local saves and all historical changelog entries.
- Do not claim deployment until the V0.52 workflow completes successfully and its head SHA matches the branch head.
