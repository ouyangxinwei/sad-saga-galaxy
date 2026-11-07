# Release Index

Current application release: **V0.77**  
Release date: **2026-11-07**  
Version Management module: **2.0.0**  
Package version: **0.77.0**  
PWA cache namespace: **v59**  
Target branch: `standalone-migration`

## Current release
- **V0.76.1 — Abnormal Status System Phase 4.1 + Phase 5 validation** ([release record](releases/V077_ABNORMAL_STATUS_PHASE41_PHASE5.md))
- Makes status details tap/keyboard accessible and adds production artifact smoke tests before Pages deployment.
- No status balance or permanent save-schema changes.

## Previous release
- **V0.76 — Abnormal Status System Phase 4** ([release record](releases/V076_ABNORMAL_STATUS_PHASE4.md))

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
