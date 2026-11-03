# Character Progression Phase 3 — v0.43

## Breakthrough rules
- A character must reach its current level cap before breakthrough.
- The current character level is preserved; the level cap increases by 10.
- There is no fixed breakthrough-count limit.
- Each breakthrough consumes that character's own shards and gold.
- First breakthrough: 3 character-specific shards + 1,000 gold.
- Each later breakthrough adds 2 shards and 1,000 gold to the previous cost.
- An operation below the level cap or without enough materials is rejected without changing the save.

## Stored EXP
EXP earned while the character is at its level cap remains in the progression record. Once breakthrough raises the cap, stored EXP is immediately processed against the newly available levels. Any remaining EXP stays stored.

## UI
Character details display the strongest progression instance for the selected card definition, current level and cap, breakthrough count, stored EXP, character shard balance, gold balance, and the breakthrough action. Duplicate-instance selection and fusion inheritance remain for Phase 4.

## Save compatibility
The existing v20 save and `characterProgression.instances` structure are retained. Player-wide level/EXP, party, equipment, and unrelated resources are not reset. Materials are deducted only after all validations pass.

## Tests
Covers cost scaling, max-level requirement, insufficient-material safety, level/cap behavior, stored EXP processing, and repeated breakthroughs.
