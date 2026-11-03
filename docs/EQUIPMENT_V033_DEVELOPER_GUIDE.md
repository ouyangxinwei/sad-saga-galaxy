# Equipment System V0.33 — Developer Guide

## Core modules
- `src/lib/gameData.js`: static catalog definitions for Relics, Weapons, and Armor. Existing relic top-level stat fields remain for compatibility; normalized `stats` and `combat` objects are added.
- `src/lib/equipment.js`: `getEquipmentDefinition`, `getEquippedItem`, `getEquipmentBonuses`, `normalizeEquipmentState`, and `equipItem`.
- `src/lib/cards.js`: applies the aggregated equipment result in `cardStats` and passes combat modifiers into `partyUnits`.
- `src/lib/battle.js`: applies damage dealt/reduction, critical damage, healing, and effective MP cost.

## Modifier data model
```js
{
  stats: {
    hpPct: 0.10,
    atkPct: 0.08,
    defPct: 0.05,
    spdPct: 0.04,
    crit: 0.03,
    critDamagePct: 0.10,
    healPct: 0.08,
    mpCostReductionPct: 0.06
  },
  combat: {
    damageDealtPct: 0.04,
    damageReductionPct: 0.05,
    healPct: 0.08,
    critDamagePct: 0.10,
    mpCostReductionPct: 0.06
  }
}
```

## Stacking and caps
All equipped slot values add together. Caps are centralized in `equipment.js`: crit 0–75%, crit-damage bonus 0–100%, healing bonus 0–150%, MP-cost reduction 0–50%, damage dealt 0–100%, and damage reduction 0–75%.

Legacy Relic fields (`hp`, `atk`, `def`, `spd`) are read as fallback values. New definitions should use `stats` to avoid ambiguity. Do not define the same base stat in both legacy fields and `stats`; `stats` overrides the fallback.

## Battle formula placement
- Damage dealt modifier applies after the existing defense and temporary damage-reduction calculations.
- Equipment damage reduction applies after existing temporary mitigation.
- Critical multiplier remains 1.65 plus the equipment critical-damage bonus.
- Healing uses the existing healing formula with the combined healing bonus.
- `effectiveMpCost(skill, unit)` is shared by skill affordability and actual MP deduction.

## Tests
Run `npm run test:equipment`. The command runs both equipment migration tests and Hybrid calculation tests. GitHub Actions runs the suite before the production build.

## Phase boundaries
Phase 2 does not add trigger dispatch, counters, kill triggers, per-trigger cooldowns, AI scoring preferences, or Forge acquisition/UI. These remain later phases.
