# Release Index

Current application release: **V0.73**  
Release date: **2026-11-06**  
Version Management module: **2.0.0**  
Package version: **0.73.0**  
PWA cache namespace: **v55**  
Target branch: `standalone-migration`

## Current release
- **V0.73 — Abnormal Status System Phase 1** ([release record](releases/V073_ABNORMAL_STATUS_PHASE1.md))
- Adds the five core battle ailments, status lifecycle handling, battle UI markers, localized logs, and focused automated tests.
- No permanent save-schema changes.

## Catalog coverage
The localized release catalog is maintained in `src/lib/version/releases.js`; this index summarizes the current release.

The catalog intentionally does not fabricate missing release descriptions. The exact records currently available remain preserved.

## Release record conventions
Each new release should have:
1. A localized catalog entry in `releases.js`.
2. Matching current metadata and package version.
3. A per-release record under `docs/releases/`.
4. A commit SHA and GitHub Actions run URL added after they exist.
5. Deployment status confirmed only when the matching branch SHA has successful build and deploy jobs.

## Historical release notes
The in-app `CHANGELOG` remains the canonical detailed feature history. This index is a navigation and release-evidence register, not a second copy of every localized bullet.
