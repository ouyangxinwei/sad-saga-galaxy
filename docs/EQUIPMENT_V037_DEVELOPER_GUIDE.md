# V0.37 Developer Guide — Equipment Validation

## Automated tests
- `scripts/equipment-runtime.test.mjs`: damage mitigation, counter safety, shields, healing, MP caps, cooldown, same-turn cap, chance failure, death guard, target ownership, battle-end dispatch, logger reasons.
- `scripts/equipment-balance.test.mjs`: catalog schema validation, 54 three-slot combinations, modifier maxima, and effect attachment.
- Existing migration, Forge, and AI tests remain part of `npm run test:equipment`.

## Runtime semantics
- Trigger ownership: `when: 'owner'` matches the event context owner; `when: 'target'` matches the event target.
- Positive cooldown N: after activation at round R, the next eligible round is R + N + 1.
- Zero cooldown: no round lock; `maxPerTurn` limits repeated checks in the same round.
- Chance failures do not consume cooldown or activation count.
- Dead owners are skipped.
- Bonus damage and counters use DEF × 0.45, temporary DR, and equipment damage modifiers. Direct equipment damage does not emit recursive attack/damage-taken events.

## Balance audit
The test enumerates every legal weapon/armor/relic combination and checks exact maximum aggregate modifiers against catalog-derived values. It also validates all 12 trigger records for supported events/effects and bounded numeric configuration.

## Debug Logger
Use `getLogs()` and filter `module === 'EquipmentTrigger'`. The `detail.reason` field explains each decision. The logger's storage format is unchanged.
