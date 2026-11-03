# V7 Phase 1 — Career-specific character stat growth (V0.47)

## Scope
- Implements V7 Phase 1 only on `standalone-migration`, based on V0.46.
- No save-schema change, save reset, cloud save, breakthrough reward, or teamwide bonus change.

## Growth model
`career multiplier = 1 + (character level - 1) × per-level rate`

The career multiplier is applied to class/rarity base stats before the existing player-level multiplier and equipment percentage bonus. MP receives career growth but remains separate from player-level scaling and equipment stat percentages.

| Archetype | HP / level | ATK / level | DEF / level | MP / level |
|---|---:|---:|---:|---:|
| Attack | 0.30% | 0.55% | 0.25% | 0.35% |
| Defense | 0.55% | 0.25% | 0.55% | 0.35% |
| Support | 0.35% | 0.25% | 0.35% | 0.55% |
| Balanced fallback | 0.40% | 0.40% | 0.40% | 0.40% |

At level 60 (59 growth steps), the primary stat gains up to 32.45%. Growth is linear, not compounded.

## Class mapping
- Attack: sword, lancer, archer, rogue, mage.
- Defense: guardian.
- Support: priest, alchemist, stargazer.
- Balanced: fallback for unknown/custom class IDs.

## Compatibility
- Uses the strongest owned progression instance for a card ID, matching deployed-character EXP policy.
- Duplicate copies retain independent records; no records are merged or rewritten.
- Base class/rarity data remains untouched.
- SPD, critical rate, skills, MP costs, player EXP, player-level scaling, rebirth, and equipment definitions are unchanged.
- Growth continues after each breakthrough; the existing level cap and breakthrough behavior are unchanged.
- V20 and later saves use existing normalization; no migration is required.

## Tests
- Career mapping and fallback.
- Level 1 baseline and exact coefficients.
- Battle HP/ATK/DEF/MP growth and unchanged SPD.
- Strongest duplicate progression selection.
- Separation from player-level and equipment modifiers.
- Existing progression, breakthrough, fusion, and V20 migration regression suite.

## Excluded from Phase 1
- Fixed breakthrough stat rewards (Phase 2).
- Teamwide +3% bonus audit/linkage (Phase 3).
- Stat breakdown and localized UI (Phase 4).
- Save export/restore (Phase 5).

## Release
- App V0.47 / package 0.47.0.
- Service worker cache v29.
- Deployment is complete only after successful GitHub Actions build and Pages deployment for the exact branch commit.
