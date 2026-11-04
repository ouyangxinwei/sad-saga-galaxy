# Formation Phase 3-C — Damage and Skill Mechanics

## Scope

Connect formation effects that modify direct damage taken, skill output, and skill MP cost. Formation-based action ordering remains Phase 3-D and is not included.

## Implemented effects

- Diamond Guard: +5% team direct-damage reduction. It is added to the defender's existing damage-reduction value and uses the existing combat mitigation calculation and cap.
- Four-Corner Core: the assigned center role gains +10% skill damage. It affects active skill damage only; the fallback Basic Attack is excluded.
- Cross Support: all five assigned allies gain +5% skill effect. It scales skill damage, healing, shield amount, and mitigation strength. It does not change skill MP cost or duration.
- Cross Support: the four outer positions gain 10% skill MP-cost reduction. It is added to the existing equipment reduction and respects the existing 50% shared maximum.

## Calculation and compatibility

- Formation effects are resolved from the active formation and that formation's independent five-position assignments.
- Characters not assigned to one of the active formation's five positions receive no formation combat modifiers.
- Damage reduction and MP-cost reduction combine additively with existing equipment-derived values; existing shared caps remain in force.
- Skill damage and skill-effect multipliers are applied to the selected skill before its combat resolution. Basic Attack is not treated as an enhanced skill.
- No V20 local-save key or schema is changed. No cloud save or broad battle-engine rewrite is introduced.

## Focused validation

- Formation resolver tests cover Diamond Guard, Four-Corner Core, Cross Support, and unassigned characters.
- Combat tests cover incoming damage reduction, skill damage/effect scaling, and MP-cost reduction including the shared cap.
- Deployment workflow runs the formation and desperate-combat focused suites plus the production build.
- Full gameplay regression remains intentionally paused.

## Deferred

Formation-based special action order (Four-Corner Core ally-last and Long Serpent formation order) remains Phase 3-D.
