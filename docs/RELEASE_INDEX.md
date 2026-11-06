# Release Index

Current application release: **V0.74**  
Release date: **2026-11-07**  
Version Management module: **2.0.0**  
Package version: **0.74.0**  
PWA cache namespace: **v56**  
Target branch: `standalone-migration`

## Current release
- **V0.74 — Abnormal Status System Phase 2** ([release record](releases/V074_ABNORMAL_STATUS_PHASE2.md))
- Connects status infliction to existing player/enemy skills, adds cleansing behavior, and teaches battle AI to value cleansing actions.
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
