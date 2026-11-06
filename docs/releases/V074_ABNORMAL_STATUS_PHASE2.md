# V0.74 — Abnormal Status System Phase 2

- Release date: 2026-11-07
- Branch: `standalone-migration`
- Scope: connect existing skills to the Phase 1 status runtime; no new persistent data or save migration.

## Skill classification
Every existing attack skill declares `damageType: 'physical'` or `damageType: 'magic'`. Blind accuracy checks therefore have an explicit and reviewable rule.

## Player status-infliction skills
| Skill | Type | Status | Chance |
|---|---|---|---:|
| Star Arrow | Physical | Blind | 16% |
| Azure Bolt | Magic | Paralysis | 16% |
| Nova Burst | Magic | Sleep | 12% |
| Silent Kill | Physical | Confusion | 12% |
| Acid Flask | Magic | Poison | 18% |
| Shadow Split | Physical | Poison | 10% |

## Enemy status-infliction skills
- Void Howl: 12% Confusion
- Star Crush: 12% Paralysis

Status is rolled only after a successful hit. Blind misses and existing dodge events cannot apply a status. Multi-hit attacks make at most one status roll per target per skill action.

## Cleansing
- Sanctuary heals all living allies and removes all five abnormal statuses.
- Erratic Elixir selects up to two allies who are injured or afflicted, heals them, and removes their abnormal statuses.
- Battle AI considers afflicted allies when scoring cleansing support skills, including when allies are at full HP.
- Cleansing is recorded with reason `cleanse`.

## Compatibility and balance
- No player save key or persistent save schema changes.
- No character progression, equipment stats, stage progression, or existing skill damage multipliers change.
- Status chances remain modest. Equipment resistance, immunity tables, and new inventory items are deferred.
- Phase 1 durations, poison damage, confusion levels, and battle cleanup are unchanged.

## Validation
Focused status tests cover skill classification, player/enemy infliction, multi-hit handling, cleansing, AI scoring, and Blind interaction.
GitHub Actions validation: **passed** in run [#524](https://github.com/ouyangxinwei/sad-saga-galaxy/actions/runs/42281664909). All targeted test suites and the production build passed; GitHub Pages deployment also completed successfully.

## Commit and deployment
- Implementation commit: `3e3c54d3bb23e942c29b7433337c5b1f72188ad6`
- Actions run: [42281664909](https://github.com/ouyangxinwei/sad-saga-galaxy/actions/runs/42281664909)
- Deployment status: **successful**
