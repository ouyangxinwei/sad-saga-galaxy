# V0.37 — Equipment System Verification, Logger Audit, and Balance

## Scope
V0.37 verifies the existing three-slot equipment system and its combat integration. It does not add new gear, acquisition, progression, or save-schema changes.

## Corrections
- Bonus damage and counter effects now use the same physical mitigation model as regular hits: target DEF, temporary damage reduction, attacker damage-dealt bonus, and target equipment damage reduction. They still do not recursively dispatch attack/counter events.
- A zero-round cooldown now means no round lock; `maxPerTurn` controls repeat attempts in that round. Positive cooldown values continue to lock the configured number of complete following rounds.
- The V0.33 changelog entry is pinned to V0.33 instead of referencing the current application version.

## Verification
`npm run test:equipment` runs migration, Forge, AI, runtime-trigger, and balance tests. The balance test audits all 12 configured trigger effects and all 54 combinations of the 3 weapons × 3 armors × 6 relics.

## Observed maximum combined modifiers
| Modifier | Maximum across all legal slot combinations |
|---|---:|
| HP | +41% |
| ATK | +32% |
| DEF | +22% |
| SPD | +22% |
| Crit rate | +3 percentage points |
| Crit damage | +20% |
| Healing | +28% |
| MP cost reduction | +12% |
| Damage dealt | +10% |
| Damage reduction | +13% |

These are catalog-derived maxima, not new runtime buffs. Existing caps remain in force.

## Trigger-rate interpretation
All 12 trigger definitions use a 0.18–0.30 chance, 1–2 round cooldown, and one activation per round. Actual activations depend on eligible events; multi-hit attacks can provide multiple chance checks, but the per-turn cap prevents repeated procs beyond the configured limit.

## Preserved
- Unique equipment ownership and three-slot save structure.
- Old save compatibility and all progression/resources.
- Active-skill MP costs and ordinary per-turn MP regeneration.
- Equipment-aware AI and all existing catalog trigger values.
- Debug Logger storage format and 2,000-record retention.
