# Character Progression Phase 2 — v0.42

## Scope
Phase 2 implements independent EXP gain and leveling for deployed characters. It does not change battle calculations, character UI, breakthrough costs, or duplicate-card fusion behavior.

## EXP sources
The existing shared reward grant path is retained. Whenever an existing reward grants player EXP (battle victory, idle reward claim, daily check-in, or another call to the grant helper), each distinct character currently deployed in the party receives the same base EXP amount.

Player EXP and player-level behavior are unchanged.

## Recipient selection
Party slots refer to card definitions rather than individual duplicate instances. Therefore each distinct deployed card definition is awarded once per grant. If multiple owned instances of that card exist, the instance with the highest level is selected; ties are resolved by current EXP, then breakthrough count, then stable instance ID order. Reserve characters do not receive EXP.

## Level curve and cap
Characters use the existing player EXP requirement curve:

`round(70 + level * 26 + level * level * 0.9)`

Each progression record levels independently up to its own `levelCap`. On reaching that cap, any remaining and subsequently earned EXP remains in the record's `exp` field. It is not discarded. A later breakthrough phase can raise `levelCap`, after which stored EXP can be consumed by subsequent EXP grants.

## Save compatibility
Phase 1's `characterProgression.instances` data remains the source of truth. No existing player EXP, level, resources, equipment, or V13 test-support marker is reset. The normal save normalization still runs on state commits.

## Tests
Regression tests cover:
- shared EXP curve and character level-up
- EXP retained at the current level cap
- deployed party recipients only
- duplicate card instances not receiving multiple copies of the same party reward
- invalid or non-positive EXP being ignored

## Deferred
- breakthrough and material consumption (Phase 3)
- fusion growth inheritance using the confirmed `strongest` policy (Phase 4)
- character progression UI (later phase)
- battle-stat scaling from character level (requires its own balancing phase)
