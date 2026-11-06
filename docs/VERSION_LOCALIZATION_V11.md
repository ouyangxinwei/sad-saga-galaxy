# Version Consistency and Localization V11

> **Historical architecture note (superseded):** This document records the original V11 implementation. Since V0.53, the active version system is **Version Management V2.0**. The canonical source is now `src/lib/version/`; `src/lib/version.js` is retained only as a backward-compatible re-export. See [Version Management V2.0](VERSION_MANAGEMENT_V2.md) and [the directory map](VERSION_DIRECTORY_MAP.md) for current ownership and release procedures.

> Branch: `standalone-migration`  
> App release: `v0.22`  
> Release date: 2026-11-03  
> Scope: in-app version display, centralized release metadata, localized changelog, and pre-build validation.

## 1. Changelog (preserved history)

- **V01** — Initial migration audit and identification of the oooo integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, UI wrappers, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the standalone app entry, dormant oooo auth/MFA/OAuth subsystem, User metadata, SDK/API references, and local save path. Classified removal candidates and retained game-critical local functionality.
- **V05** — Retired dormant oooo authentication/MFA/OAuth files and oooo SDK/Vite packages; removed oooo project metadata; renamed package and README to `oooo app`; replaced oooo favicon/title; reviewed seven routes and v20 save contract; added PWA manifest, custom SVG icons, scoped service-worker registration, offline navigation fallback, runtime asset caching, and bundle precaching.
- **V06** — Verified the production Actions build/deployment and reviewed seven route definitions and residual oooo integration references. Browser Console/Network and manual route interaction remained unverified.
- **V07** — Deferred real-browser v20 legacy-save read/write testing by user instruction. Existing local save key/schema and game logic were left unchanged; cloud save is a separate future design item.
- **V08** — Reviewed PWA manifest and service-worker behavior; changed favicon and manifest references to Vite's `%BASE_URL%` token; documented installation/offline test procedures and remaining real-device validation items.
- **V09** — Performed a source-level gameplay regression review of seven routes, main navigation, formation, synthesis, forge, battle simulation/rewards, settings persistence path, and responsive layout classes. Added a repeatable manual test matrix; actual browser interactions remain pending.
- **V10** — Moved shared game modals to a document-level portal to escape the AppShell stacking context and reliably layer above fixed bottom navigation; added dynamic viewport-height constraints, safe-area padding, non-shrinking header, and contained modal-body scrolling. No game logic or save behavior changed.
- **V11** — Centralized the in-app release version; synchronized the home version button, settings version label, and release-history header; added Chinese/Japanese/English release notes; added a pre-build validator for package/app version and translation completeness; bumped the PWA cache namespace.

## 2. Implementation

- `src/lib/version.js` is the single source of truth for the in-app version, release date, and localized release history.
- Home version action displays the current version beneath its localized label.
- Release-history dialog reads the same version/date metadata and chooses the matching Chinese, Japanese, or English title and bullet list.
- Settings page reads the same version value; the previous hard-coded design-draft label was removed.
- `package.json` version is aligned to `0.22.0`.
- `npm run build` now runs `npm run validate:version` before Vite. The validator checks app/package version alignment and requires non-empty title and notes for every supported language in every release entry.
- Service-worker cache namespace advanced from `oooo-app-shell-v2` to `oooo-app-shell-v3` so clients can refresh assets after deployment.

## 3. Validation

- Static source review: version display surfaces use `APP_VERSION` from the central module.
- Localization: current supported languages are `zh`, `ja`, and `en`; V11 release title and notes are present for all three.
- Build-time validation: wired into `npm run build`; actual Actions result must be checked after commit.
- Real-device/browser language-switch and cache-refresh testing: pending until deployment and manual device verification.

## 4. Compatibility

- Local save key remains `saga_galaxy_save_v20`.
- Save schema remains version 20.
- No gameplay rules, rewards, battle engine, routes, or local save data were changed.
- No dependencies were added.
- Cloud save remains out of scope.

## 5. Release rule going forward

For every release, update the central version metadata and add the complete localized changelog entry for every language in `LANGS`. Keep the package version aligned. The build validator must pass before deployment. Do not call a version live until the corresponding GitHub Actions deployment succeeds.
