# Equipment System V0.33 — Phase 2 Specification

## Goal
Implement one additive calculation pipeline for the three equipment slots. Equipment now contributes both base attributes and passive Hybrid combat modifiers.

## Base attributes
- `hpPct`, `atkPct`, `defPct`, `spdPct`: proportional stat increases.
- `crit`: additive crit-rate points (for example, 0.03 = +3 percentage points).
- `critDamagePct`: additive critical-damage multiplier.
- `healPct`: additive healing bonus.
- `mpCostReductionPct`: MP skill-cost reduction.

## Hybrid combat modifiers
- `damageDealtPct`: increases final damage after defense and existing mitigation.
- `damageReductionPct`: reduces incoming damage after existing battle mitigation.
- `healPct`: increases healing output.
- `critDamagePct`: increases the existing 1.65 critical multiplier.
- `mpCostReductionPct`: reduces the skill MP cost used by both AI affordability checks and actual MP deduction.

All values from equipped slots are additive. Safety caps: crit 75%, crit-damage bonus +100%, healing bonus +150%, MP-cost reduction 50%, damage dealt +100%, damage reduction 75%.

## Current item data
The six existing relics retain their previous HP/ATK/DEF/SPD values and receive one modest Hybrid combat modifier. Three weapon and three armor definitions are added to the static catalog as calculation fixtures/future content. They are not granted to player inventory and cannot yet be acquired through Forge; acquisition and UI belong to a later phase.

## Compatibility
- Existing save key and save schema remain unchanged; no migration is required for V0.33.
- Existing relic inventory and equipped relic IDs continue to work.
- With no equipment modifiers, battle formulas remain equivalent to V0.32.
- Existing MP regeneration (+14 at round end), skills, party size, LP/revival rules, and enemy behavior remain unchanged.

## Excluded
Trigger-based effects such as counterattacks, kill-based MP recovery, turn-start effects, trigger cooldowns, and battle event dispatch remain Phase 3. AI strategic preference changes remain Phase 4. Forge UI and item acquisition remain Phase 5.

## Acceptance criteria
- All three slots contribute to one stat/combat modifier result.
- Legacy relic attributes are not lost or double-counted.
- Damage, damage reduction, critical damage, healing, and MP cost use equipment modifiers.
- AI skill affordability and MP deduction use the same effective MP cost.
- Modifier stacking is bounded and covered by automated tests.
