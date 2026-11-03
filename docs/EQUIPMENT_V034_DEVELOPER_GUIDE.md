# V0.34 Developer Guide

- Item trigger data is stored in gameData.js; getEquipmentEffects attaches equipped triggers to battle units.
- dispatchEquipmentEvent is the single event gateway and enforces event matching, owner/target matching, living-owner checks, chance, cooldown, per-turn caps, and effect whitelist.
- Runtime cooldowns and counts are battle-local and never saved.
- Whitelisted effect types: bonus_damage, counter, shield, heal_lowest, restore_mp.
- Counter damage uses the direct damage path and does not dispatch onDamageTaken, preventing counter loops.
- Debug Logger module EquipmentTrigger records triggered, cooldown_set, chance_failed, cooldown, per_turn_limit, and effect_not_applicable.
- Test command: npm run test:equipment.
