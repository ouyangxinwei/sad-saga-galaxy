# Equipment System V0.32 — Phase 1 Specification

## Goal
Introduce the stable data foundation for the confirmed three-slot, Unique, Hybrid equipment system without implementing combat effects or redesigning the Forge UI.

## Included
- Three slots per character: `weapon`, `armor`, and `relic`.
- Unique assignment: one equipment ID per slot can be worn by only one character at a time.
- Weapon and Armor inventory extension points; existing `relics` remains canonical for Relics.
- Legacy flat Relic assignment migration to nested loadouts.
- A one-time raw save backup and independent `equipmentSchemaVersion`.
- Existing relic definitions, stat bonuses, character progression, resources, battle logic, and save key remain intact.
- Automated tests for migration, idempotence, ownership checks, uniqueness, and unequip.

## Legacy migration
Legacy `equipped: { heroId: relicId }` becomes `equipped: { heroId: { weapon: null, armor: null, relic: relicId } }`. Duplicate assignments for the same slot/item ID are resolved deterministically: the first valid wearer is retained; later assignments are set to null. Inventory quantities are not deducted.

## Excluded from Phase 1
Weapon/Armor item catalogs and balance, Hybrid effects, battle event dispatch, trigger handling, AI scoring, set bonuses, and the full Forge equipment UI.

## Acceptance criteria
- Existing v20 saves load with unrelated fields preserved.
- Existing Relic stat bonuses still apply through the nested Relic slot.
- Migration is deterministic and idempotent.
- The raw pre-migration save is preserved before migrated state can be persisted.
- Invalid or conflicting equip requests do not alter the assigned item.
- Equipment tests and production build pass in GitHub Actions.
