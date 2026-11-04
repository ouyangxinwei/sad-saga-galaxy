# Release Index

Current application release: **V0.53**  
Release date: **2026-11-04**  
Version Management module: **2.0.0**  
Package version: **0.53.0**  
PWA cache namespace: **v35**  
Target branch: `standalone-migration`

## Current release
- **V0.53 — Standalone Version Management System V2.0**
- Adds the dedicated version module, compatibility API, historical audit, stronger build validation, automated tests, and maintenance documentation.
- No gameplay or save-schema changes.

## Catalog coverage
The currently documented localized catalog contains **36 records** from V0.18 through V0.53. The catalog is maintained in `src/lib/version/releases.js`.

| Finding | Treatment |
|---|---|
| V0.01–V0.17 | Not present in the current catalog; recovery requires verifiable Git history or original artifacts |
| V0.28 | Missing from the current catalog; retained as an explicit historical gap |
| V0.29 | Appears more than once; retained and flagged as a known legacy duplicate pending source verification |

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
