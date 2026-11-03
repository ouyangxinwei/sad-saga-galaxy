# V0.35 Developer Guide — Equipment-aware AI

## Implementation
- equipmentAiProfile(unit) derives tactical weights from unit.equipmentEffects.
- scoreSkills(unit, allies, foes, round) exports deterministic candidate scores for tests and diagnostics.
- chooseSkillImpl retains the existing randomized tie variation and threshold, then logs all candidates through the BattleAI module.

## Effect mapping
- bonus_damage: offensive value; larger relative value for AoE when multiple foes remain.
- heal_lowest: support value when at least one ally is wounded.
- shield: defense value for shield/mitigation skills.
- counter: taunt value.
- restore_mp: modest value for affordable active skills.

Weights are bounded to prevent extreme score inflation. Effect mapping is based on event/type configuration, not equipment IDs.

## Invariants
- MP cost calculation and affordability check are unchanged.
- Per-round MP regeneration is unchanged.
- Equipment event dispatch and runtime cooldowns are unchanged.
- Save schema, Forge UI, and equipment inventory are unchanged.
- Existing base scores remain unchanged when no relevant trigger is equipped.

## Tests
scripts/equipment-ai.test.mjs covers unchanged no-equipment base scores, offensive/AoE synergy, healing, defense/taunt, and MP recovery affordability.
