# V0.53 — Version Management V2.0

- Date: 2026-11-04
- Scope: independent version metadata/catalog/API/validation/docs.
- App version: v0.53
- Package version: 0.53.0
- Version Management module: 2.0.0
- PWA cache namespace: v35
- Save schema: unchanged (V20)

## Changes
- Split current metadata, localized release history, historical audit, validation rules, and lookup API into `src/lib/version/`.
- Preserved `src/lib/version.js` as a compatibility re-export.
- Added pre-build validation and automated version-management tests.
- Added release index and directory/maintenance documentation.

## Compatibility
No gameplay logic, local save key, save schema, player progress, or existing release-history data was intentionally changed. Historical catalog entries are preserved; unresolved missing/duplicate labels are explicitly reported.

## Verification record
Commit SHA and GitHub Actions run details are added after the commit and workflow complete. Deployment must not be described as successful until both build and deploy jobs pass for the branch's exact commit SHA.
