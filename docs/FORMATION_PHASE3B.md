# Formation Phase 3-B — Probability and Conditional Mechanics

## Scope

This phase completes the probability and conditional mechanics that are already described by the eight formation definitions. It does not implement formation damage reduction, skill-effect multipliers, MP-cost reduction, or formation-based action ordering; those remain later Phase 3 work.

## Probability rules

- Character desperate-critical and desperate-dodge base rates remain independently and deterministically derived from each character's initial attributes.
- Base character rates remain in the approved 10%–30% range, including the stable per-character adjustment.
- Formation bonuses are additive percentage-point bonuses and are applied after the base character rate.
- Effective desperate-critical chance is capped at 35%; effective desperate-dodge chance is capped at 45%. These limits preserve the largest currently defined formation bonuses without changing base-rate generation.
- Ordinary critical chance remains capped at 75%.

## Conditional formation effects

- Star: the assigned core receives +5 percentage points of desperate-critical chance.
- Spearhead: assigned wing positions receive +5 percentage points of ordinary critical chance.
- Diamond Guard: the assigned rear position receives +10 percentage points of desperate-dodge chance.
- Long Serpent: when allied actors act consecutively in the same round, each subsequent ally receives +5 percentage points of ordinary critical chance for that action. An enemy action interrupts the chain. Formation-position action ordering is not part of this phase.
- Staggered Skirmish: all assigned allies receive +5 percentage points of desperate-dodge chance; an ally whose final battle SPD is strictly greater than the five-member allied average receives another +5 percentage points.
- Balanced Ring: all assigned allies receive +3 percentage points of ordinary critical and desperate-dodge chance.
- Other formations do not gain probability effects that are not defined in their metadata.

## Trigger conditions retained

- Desperate critical: allied living character HP is strictly below 20% of max HP; a multi-hit or area skill makes one desperate-critical roll per skill action and applies the triple-damage multiplier to all direct damage hits in that action.
- Desperate dodge: allied living character HP is strictly below 10% of max HP; each enemy direct hit is checked independently.
- HP exactly at 20% or 10%, dead characters, enemy units, and non-direct damage remain excluded as before.

## Character details

- Static ordinary critical and desperate probabilities are sourced from the same battle-unit calculation used by combat.
- Conditional bonuses are labelled separately: high-speed dodge is shown only when the character's final battle SPD exceeds the allied average; Long Serpent follow-up critical is shown as conditional, not as an always-on addition.
- Chinese, Japanese, and English labels are maintained.

## Compatibility and validation

- No V20 save key, save schema, or local progress data is changed.
- Focused tests cover formation metadata, conditional bonus gating, probability caps, threshold behavior, multi-hit desperate critical, and consecutive allied action critical.
- Full gameplay regression is intentionally out of scope for this phase.
