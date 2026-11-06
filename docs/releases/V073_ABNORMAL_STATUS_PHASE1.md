# V0.73 — Abnormal Status System Phase 1

- Release date: 2026-11-06
- Branch: `standalone-migration`
- Scope: core battle-state runtime only; no skill catalog, equipment resistance, or permanent save changes.

## Implemented rules

| Status | Rule | Duration |
|---|---|---:|
| Sleep | Cannot act; damage removes it | 2 rounds |
| Paralysis | Cannot act; damage does not remove it | 2 rounds |
| Poison | Deals 3% of maximum HP at round end | 3 rounds |
| Blind | Explicitly physical attacks use 60% accuracy | 3 rounds |
| Confusion Lv.1 | 30% chance to lose the action | 3 rounds |
| Confusion Lv.2 | 50% chance to misdirect an attack or heal | 3 rounds |
| Confusion Lv.3 | Forces a basic attack against a random other unit | 3 rounds |

Reapplying a status refreshes its duration. Reapplying Confusion increases its level by one up to Lv.3. Different statuses can coexist.

## Integration

- Added `src/lib/abnormalStatus.js` for definitions, normalization, application, removal, duration ticking, and confusion decisions.
- Integrated action blocking, poison ticks, physical-accuracy checks, confusion action changes, sleep wake-up, and temporary-status cleanup into `src/lib/battle.js`.
- Added status chips to battle units and localized battle-log messages.
- Added automated tests in `scripts/abnormal-status.test.mjs`; included them in `npm run test:combat`.

## Compatibility

- Statuses are battle-runtime data only.
- No player save key, permanent save schema, character progression, equipment data, stage progression, or existing skill definitions are changed.
- Blind accuracy only applies when a skill explicitly declares `damageType: 'physical'`. Existing skills have not yet been reclassified; skill integration is deferred to Phase 2.
- Equipment resistance and status-inflicting skills are deferred to later phases.

## Validation

- Automated test and build results: pending matching GitHub Actions run.

## Commit and deployment

- Commit: pending
- Actions run: pending
- Deployment status: pending
