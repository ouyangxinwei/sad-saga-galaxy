# Equipment System V0.32 — Player Guide

## What changed
Every character now has three equipment slots: Weapon, Armor, and Relic. This release establishes the data and ownership rules; the existing Forge screen continues to manage Relics as before. Weapon and Armor catalogs and their UI are planned for later phases.

## Unique equipment rule
- The same equipment ID can be equipped by only one character at a time.
- An item must exist in the corresponding inventory before it can be equipped.
- Unequipping returns the item to the available inventory; it does not consume or destroy it.
- If another character already wears that same item ID, the equip operation is rejected.

## Existing relics and saves
All six existing relic definitions and relic stat bonuses remain available. Existing character levels, cards, party, resources, progression, and the v20 save key are preserved. On first load after this update, old relic assignments are converted to the new three-slot format. If an old save assigned the same relic ID to multiple characters, the first valid assignment is kept and the others are unequipped.

A raw copy of the pre-migration save is kept in browser local storage under `saga_galaxy_save_v20_equipment_backup_v1`. Do not clear browser site data if you need that recovery copy.

## Current scope
This is the foundation release only. Weapon and Armor content, hybrid combat effects, AI behavior changes, and the full equipment management UI are not included yet.
