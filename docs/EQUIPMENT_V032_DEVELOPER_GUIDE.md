# Equipment System V0.32 — Developer Guide

## Data model
The save keeps the existing `saga_galaxy_save_v20` key and save version 20. Equipment migration is tracked independently:

```js
equipmentSchemaVersion: 1,
equipmentInventory: { weapon: {}, armor: {} },
equipped: {
  lise: { weapon: null, armor: null, relic: "r_sword" },
  kain: { weapon: null, armor: null, relic: null }
}
```

The legacy `relics` object remains the relic inventory. Weapon and Armor inventories are separate extension points.

## Core module
`src/lib/equipment.js` provides slot constants, `getEquippedItem`, `normalizeEquipmentState`, and `equipItem`. Normalization is deterministic and idempotent. It converts legacy string values into the Relic slot, fills missing slots with null, and enforces one wearer per slot/item ID.

## Migration and recovery
`src/lib/save.js` creates a one-time raw JSON backup before normalizing a pre-v1 equipment save. The backup key is `saga_galaxy_save_v20_equipment_backup_v1`; an existing backup is never overwritten. If parsing or backup creation fails, save writes are blocked for the current page session so the provider persistence effect cannot replace the original data with a default save.

The migration marker is `equipmentSchemaVersion: 1`. The original save key and `version: 20` remain unchanged.

## Unique rule
Uniqueness is enforced by slot + equipment ID. An item ID cannot be assigned to two characters in the same slot. Inventory ownership is checked before equip. Unequip writes null to the selected slot.

## Integration
- `cards.js` reads Relic from the nested loadout.
- `GameContext` exposes generic `actions.equipEquipment(cardId, slot, itemId)`; `equipRelic` remains as a compatibility wrapper.
- Forge keeps its current Relic interface and reads `equipped[cardId].relic`.
- No battle formulas, skill costs, battle events, or AI scoring are changed in this phase.

## Tests
Run `npm run test:equipment`. GitHub Actions runs these tests before the production build.
