# Version Management V2.0

## Purpose
This module is the independent source and validation layer for application release metadata. It does not own gameplay, save data, save-schema migrations, or deployment execution.

## Source layout
- `src/lib/version/metadata.js`: current app version, release date, release channel, and version-system version.
- `src/lib/version/releases.js`: complete currently available localized release catalog.
- `src/lib/version/history-audit.js`: explicit, non-fabricated historical gaps and known duplicate labels.
- `src/lib/version/validation.js`: pure validation logic shared by the build validator and automated tests.
- `src/lib/version/index.js`: public read-only query API.
- `src/lib/version.js`: backward-compatible re-export for existing imports; do not add new version data here.
- `scripts/validate-version.mjs`: build-time validation entry point.
- `scripts/version-management.test.mjs`: automated tests for API and validation rules.
- `docs/RELEASE_INDEX.md`: human-readable release inventory and release links.
- `docs/VERSION_DIRECTORY_MAP.md`: repository directory and ownership map.
- `docs/releases/`: per-release technical handoff records.

## Public API
Import from `@/lib/version` (or relative `src/lib/version/index.js`):
- `APP_VERSION`, `RELEASE_DATE`, `RELEASE_CHANNEL`, `VERSION_SYSTEM_VERSION`
- `CHANGELOG`, `CURRENT_RELEASE`, `VERSION_HISTORY_AUDIT`
- `getReleaseByVersion(version)`
- `getReleaseNotes(version, language)`
- `getVersionOverview()`

The API is read-only. UI components should select localized notes using the active game language; they must not maintain their own hard-coded version strings.

## Release procedure
1. Update `metadata.js` with the next application version and release date.
2. Add exactly one new entry at the top of `releases.js`, with the same version/date and complete `zh`, `ja`, and `en` titles and notes.
3. Update `package.json` to the matching numeric version (for example, `v0.54` → `0.54.0`).
4. Increment the Service Worker cache token in `public/sw.js` when a release changes cached application assets. The cache token is independent from app version and save schema.
5. Add a per-release record under `docs/releases/` and update `docs/RELEASE_INDEX.md`.
6. Run `npm run validate:version`, `npm run test:version-management`, the project regression suite, and production build.
7. Commit to `standalone-migration`; verify GitHub Actions build and deploy jobs and confirm the deployed SHA equals the branch commit before announcing the release.

## Validation policy
Build fails for current/package version mismatch, current release mismatch, date mismatch, invalid version format, unexpected duplicate labels, incorrect ordering, unexpected gaps inside the documented range, missing translations, empty notes, or malformed cache token.

Known legacy anomalies are explicitly allowlisted and reported as warnings. Do not add a new anomaly to the allowlist merely to make a failed check pass. Verify against Git history or original artifacts first.

## Version dimensions (do not conflate)
- App release: user-facing game version, currently `v0.53`.
- Version Management module: `2.0.0`.
- npm package: `0.53.0`, mechanically aligned with app release.
- Service Worker cache: `oooo-app-shell-v35`, independently incremented when cached assets change.
- Save schema: `20`, unrelated to app release numbering.
- Feature/document versions (for example V7 Phase 6 or V1.0): subsystem specification identifiers, not app releases.
- Git commit and GitHub Actions run: immutable source/deployment evidence, not version numbers.

## Compatibility and safety
The old `src/lib/version.js` import path remains available. Existing release-history UI continues reading the same `CHANGELOG` shape. No game save key, save schema, gameplay calculation, resource, or progression data is changed by this module.
