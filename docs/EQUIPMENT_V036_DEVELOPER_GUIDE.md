# V0.36 Developer Guide — Forge UI

- `src/pages/Forge.jsx` renders party selection, three slots, catalog/inventory, details, comparison, relic crafting, and furnace.
- Catalog definitions use `EQUIPMENT_CATALOG`; ownership reads `relics` or `equipmentInventory.weapon/armor`.
- Equipped state reads `getEquippedItem`; `equipItem` remains the authority for ownership and Unique restrictions.
- `GameContext.equipEquipment` calls `persist(nextState)` before committing. A failed write logs a warning, displays a message, and leaves state unchanged.
- Forge selection, comparison, equip, and unequip use the shared logger.
- No schema migration, acquisition cost, inventory grant, rarity field, battle calculation, trigger, AI, MP, or progression change.

Validation: `npm run test:equipment`, `npm run lint`, `npm run build`.
