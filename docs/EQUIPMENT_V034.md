# V0.34 — Battle Events & Equipment Triggers

Ten hooks: onBattleStart, onTurnStart, onAttack, onCritical, onDamageTaken, onHeal, onKill, onSkillUsed, onTurnEnd, onBattleEnd.

Item effects are data-only and support chance, cooldown in rounds, maxPerTurn, and owner/target matching. Whitelisted effects: bonus_damage, counter, shield, heal_lowest, restore_mp. Dead owners are skipped. Counter damage cannot recursively trigger counters. Runtime cooldowns and counts are discarded at battle end and never enter saves.

Run npm run test:equipment, npm run validate:version, and npm run build.
