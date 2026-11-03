# GitHub Deployment Status V1.0 — Developer Guide

## Files
- `src/lib/githubDeployment.js`: GitHub REST API client, exact SHA matching, job verification, 30-second in-memory cache.
- `src/components/dialogs/PatchesDialog.jsx`: UI, auto-check on open, manual refresh, workflow link.
- `src/lib/i18n.js`: zh/ja/en translations.
- `src/lib/version.js`: v0.30 changelog, previous versions preserved.
- `.github/workflows/deploy-pages.yml`: injects build SHA and branch.
- `public/sw.js`: cache version v11.

## API
1. `GET /repos/ouyangxinwei/sad-saga-galaxy/actions/workflows/deploy-pages.yml/runs?branch=standalone-migration&per_page=100`
2. `GET /repos/ouyangxinwei/sad-saga-galaxy/actions/runs/{run_id}/jobs?per_page=100`

Require exact `head_sha` and `head_branch`, successful workflow conclusion, and completed successful `build` and `deploy` jobs. Missing metadata, missing jobs, or API errors resolve to Unknown. Public unauthenticated API only; no PAT.

Local dev has no Actions build metadata and should show Unknown. Validate with `npm run validate:version`, `npm run lint`, `npm run typecheck`, and `npm run build`; then verify both Actions jobs for the exact deployed commit.
