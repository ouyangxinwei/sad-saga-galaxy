# Equipment System V0.33 — Player Guide

## What changed
Equipped Relics now provide both their existing base-stat bonuses and a passive Hybrid battle trait. These traits are automatically applied when a battle starts.

| Relic | Existing base-stat role | New Hybrid trait |
|---|---|---|
| Starblade Shard | ATK +12% | Critical damage +10% |
| Shield of Sorrow | HP +18%, DEF +10% | Damage taken -8% |
| Galactic Wing | ATK +6%, HP +6%, SPD +12% | Skill MP cost -6% |
| Core Orb | ATK +20%, HP +10% | Damage dealt +6% |
| Crown of Old Kings | ATK +16%, HP +20%, DEF +8% | Damage dealt +4%, damage taken -4% |
| Tear of the Star Sea | ATK +10%, HP +26%, SPD +6% | Healing +10% |

The new trait is additive with other equipped equipment. For example, damage dealt bonuses from a weapon and relic combine before the final damage is applied.

## Weapon and Armor
The V0.33 data catalog now contains initial Weapon and Armor definitions for the calculation system. They are not automatically added to your inventory and are not yet obtainable through the current Forge screen. Their acquisition and equipment-management UI will arrive in a later phase.

## Battle behavior
- Critical damage, healing, and incoming/outgoing damage now account for equipment modifiers.
- MP cost reduction is applied both when the automatic battle AI checks whether a skill is affordable and when MP is deducted.
- MP still regenerates by the existing amount at round end.
- No trigger-based effects such as counterattacks or kill-based recovery are included yet.

No save reset or manual migration is required. Your existing character progression and relic inventory remain intact.
