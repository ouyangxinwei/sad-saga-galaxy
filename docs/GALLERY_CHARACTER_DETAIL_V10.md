# Gallery Character Detail V1.0

## Overview

Version v0.27 adds character-detail access to the hero tab of the Gallery. The Gallery reuses the shared `CharacterDetailDialog` introduced in v0.26; it does not introduce a second stat or skill calculation path.

## Interaction

- Tapping an owned hero card opens that hero's character detail dialog.
- Unowned hero cards remain locked and do not open details.
- Enemy Gallery cards retain their existing behavior.
- Closing the detail dialog returns to the Gallery without resetting the current tab or filter.
- The Gallery's collection counts, filters, copy badges, shard badges, and fusion entry remain unchanged.

## Displayed information

The dialog continues to show the shared v0.26 information: level, rebirth, power, maximum HP/MP, ATK, DEF, SPD, critical rate, equipped relic and its bonuses, active skills, and class passive.

HP/MP are maximum values outside battle. Current battle values remain owned by the battle session and are not persisted as out-of-battle character state.

## Compatibility

This is a UI-only integration. It does not change save keys, save schema version 20, combat calculations, character progression, or Gallery collection rules.
