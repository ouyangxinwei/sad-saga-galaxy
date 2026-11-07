# V0.77 — Abnormal Status Phase 4.1 + Phase 5 Release Validation

- Release date: 2026-11-07
- Branch: `standalone-migration`
- Package version: `0.77.0`
- PWA cache namespace: `v59`
- Patch-sized presentation improvements and expanded release validation; no combat-balance or persistent-save changes.

## Phase 4.1 — small presentation fixes
- Active status chips are keyboard- and tap-expandable.
- Expanded details show the localized status name, effect explanation, and remaining rounds.
- Confusion level is included in localized accessible labels.
- Resistance and boss-immunity indicators expose readable labels for assistive technology.
- No battle simulation, ailment probability, equipment value, or save schema changes.

## Phase 5 — test, build, and deployment pipeline
- Run formation configuration tests.
- Run save progress comparison tests.
- Run save backup/restore tests.
- Run combat and abnormal-status tests, including Phase 4.1 presentation tests.
- Build the production site.
- Run production artifact smoke tests against `dist/`: entry bundle references, PWA manifest/scope, declared icons, and Service Worker cache version.
- Deploy to GitHub Pages only after the build and artifact checks succeed.
- Post-deployment browser smoke check: confirm the deployed page and manifest are served successfully.

## Validation results
- Automated tests: pending
- Production build: pending
- Artifact smoke tests: pending
- GitHub Pages deployment: pending
- Post-deployment browser check: pending

## Commit and deployment
- Implementation commit: pending
- Actions run: pending
- Deployment status: pending
