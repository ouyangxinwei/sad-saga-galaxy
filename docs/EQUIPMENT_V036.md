# V0.36 — Forge Equipment Management

- Manage weapon, armor, and relic slots for the current five-person party.
- Browse catalog and owned counts; search by localized name; filter all, owned, or equipped.
- Equip, unequip, replace owned items, and locate the current wearer.
- Inspect configured base stats, combat modifiers, and special trigger settings.
- Compare current stats with projected stats after equipping an owned item.
- Existing relic crafting and furnace remain available.

## Compatibility and constraints
Reuses existing catalog, inventory, equipped state, and Unique validation. No save migration or new combat mechanics. Catalog entries with zero inventory remain visible but cannot be equipped. The catalog has no quality field, so no rarity filter is fabricated. Equipment changes persist synchronously before UI state changes; failed writes leave the assignment unchanged. V0.35 triggers, AI, MP rules, and progression remain unchanged.
