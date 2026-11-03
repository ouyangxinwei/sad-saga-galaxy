# V0.37 Player Guide — Equipment Diagnostics

1. Open Settings → Debug Console (or use `#/debug`).
2. Filter the module to `EquipmentTrigger`.
3. Review `reason` in each entry:
   - `triggered`: the effect ran.
   - `chance_failed`: the random roll did not meet the configured chance.
   - `cooldown`: the effect is still cooling down.
   - `per_turn_limit`: the configured same-turn activation limit was reached.
   - `effect_not_applicable`: the trigger matched, but its target/state could not use the effect.
   - `cooldown_set`: records the next eligible round.
4. Reproduce the situation in battle and export JSON/TXT from Debug Console if a problem needs investigation.

The tests use deterministic random values, so they verify trigger logic without relying on luck. Debug records are local to this browser and can be cleared independently of game saves.
