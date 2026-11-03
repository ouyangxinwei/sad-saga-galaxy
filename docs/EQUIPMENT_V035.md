# V0.35 — Equipment-aware Auto-battle AI

## Scope
V0.35 connects the existing data-driven equipment trigger definitions to automatic skill evaluation. It does not change Forge, equipment ownership, trigger dispatch, save schema, active-skill MP costs, or normal round MP regeneration.

## Tactical signals
- Offensive triggers (bonus_damage on attack/critical) raise attack value; multi-target attacks gain additional value when multiple enemies remain.
- Healing triggers (heal_lowest on heal/turn start) raise support-skill value when allies are wounded.
- Defensive shield triggers raise shield/mitigation value.
- Counter triggers raise taunt value because taunt can direct enemy attacks toward the counter-capable unit.
- restore_mp on skill use modestly raises the value of affordable active skills. MP affordability is still checked before scoring.

All signals are derived from equipped trigger data and effect types, not individual equipment IDs. Base scores remain unchanged when no matching effects are present. Existing random score variation remains in place.

## Diagnostics
The BattleAI.chooseSkill log includes unit, round, selected skill ID, candidate base scores, equipment bonuses, final scores, random-adjusted scores, and whether equipment effects were present.

## Validation
Run npm run test:equipment and npm run build. V0.35 keeps the existing save format and V0.31 Debug Logger.
