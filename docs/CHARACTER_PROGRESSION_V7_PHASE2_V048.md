# V7 Phase 2 — Fixed breakthrough stat rewards (V0.48)

## Scope
- Branch: `standalone-migration`; based on V0.47 Phase 1.
- Data-layer and battle-stat integration plus regression tests.
- No UI redesign, teamwide +3% changes, cloud save, or save reset.

## Fixed reward per successful breakthrough
Flat raw stat points granted once per successful breakthrough:

| Archetype | HP | ATK | DEF | MP |
|---|---:|---:|---:|---:|
| Attack | +20 | +6 | +2 | +3 |
| Defense | +35 | +2 | +6 | +3 |
| Support | +20 | +2 | +3 | +8 |
| Balanced fallback | +25 | +4 | +4 | +4 |

Existing classes map to Phase 1 archetypes. Unknown/custom classes use balanced rewards.

## Calculation
- Each progression record stores cumulative `breakthroughBonuses: { hp, atk, def, mp }`.
- A successful breakthrough adds exactly one archetype reward after existing level-cap/material checks.
- Fixed bonuses are added after career growth, player-level scaling, and equipment percentage modifiers. They are not scaled by those modifiers.
- SPD, crit, skills, and MP costs are unchanged.

## Existing breakthrough rules preserved
- Character must be at its current level cap.
- Character level stays unchanged; level cap increases by 10.
- Breakthroughs remain unlimited.
- Existing cost formula is unchanged: shards = 3 + 2 × previous breakthrough count; gold = 1000 × (previous count + 1).
- Stored EXP is processed after the cap increase, retaining any remainder.

## Save and fusion compatibility
- Existing records without `breakthroughBonuses` are backfilled from their existing breakthrough count and career reward.
- Backfill does not alter level, EXP, resources, equipment, party, or stage progress.
- Rewards are cumulative and stored on each individual card instance.
- Existing strongest-record fusion copies the complete record, including `breakthroughBonuses`.

## Tests
- Career reward table and class mapping.
- Exactly-once reward per successful breakthrough.
- Repeated/unlimited breakthroughs and cumulative totals.
- Legacy save backfill from breakthrough count.
- Battle stat integration without multiplying fixed bonuses.
- Strongest fusion record inherits complete breakthrough bonus data.
- Existing Phase 1 and earlier progression regressions.

## Release
- App V0.48 / package 0.48.0.
- Service worker cache v30.
- Deployment requires successful GitHub Actions tests, build, Pages deployment, and matching deployed commit SHA.
