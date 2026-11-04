# Formation Phase 3-D — Special Action Order

## Scope

Connect the two formation metadata action-order effects without changing character SPD, party membership, formation assignments, or the V20 save schema.

## Four-Corner Core

- The assigned center/core character acts after every other living ally in that round.
- The remaining allied characters retain descending final battle SPD order.
- Enemy action positions remain based on the existing global SPD order; allied reordering does not move enemy turns.

## Long Serpent

- Living allied characters act in the order of their assigned formation positions, from slot 1 through slot 5.
- The allied actors are placed into the allied action slots of the existing global SPD order. Enemy actors retain their speed-derived slots and relative order.
- The formation position order is recalculated each round from living units.

## Shared behavior

- Only the currently active formation assignment is used.
- Dead allies are excluded from the round order; existing revival and action-loop behavior remains unchanged.
- Existing speed stats and other formation modifiers remain unchanged.
- The order is not persisted separately; it is derived from the active formation and current assignment at battle time.
- No cloud save or V20 save-schema migration is introduced.

## Focused validation

- Tests verify Long Serpent's allied slot order while enemy action slots remain fixed.
- Tests verify Four-Corner Core's center actor is last among allies while other allies remain speed-ordered.
- Formation metadata tests verify the action-order effect is resolved from the assigned role and slot.
- Full gameplay regression remains intentionally paused.
