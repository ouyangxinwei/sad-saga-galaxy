# Character Detail System V1.0 Specification

## Release
- App version: v0.26
- Package version: 0.26.0
- Branch: standalone-migration
- Interaction: Scheme A — tapping a character card opens details directly.

## Scope
The feature is a read-only character profile with navigation shortcuts. It does not alter combat rules, character progression, equipment ownership, or save schema.

## Entry points
- Home tactical party cards: tap a card to open the profile.
- Formation party cards: tap a card to open the profile.
- Formation owned-card list: tap a card to open the profile.
- The profile can place that character into the currently selected formation slot.
- The slot number under each formation position selects the target slot. The card itself opens details.

## Profile content
- Identity: localized name, rarity, class, level, rebirth, power.
- Vital attributes: maximum HP and maximum MP.
- Combat attributes: ATK, DEF, SPD, crit rate.
- Equipment: equipped relic and its HP/ATK/DEF/SPD modifiers; empty state if none.
- Active skills: localized name, skill kind, target, MP cost, and defined combat effect values.
- Class passive: localized class passive description.
- Equipment shortcut: opens Forge with the selected card ID in the query string.

## Data sources
- `getCardDef` / `classOf` / `SKILLS` in `src/lib/gameData.js` and `src/lib/cards.js`.
- `cardStats` and `relicOf` calculate equipment-adjusted stats.
- `powerOf`, `level`, and `rebirth` come from GameContext.

## Important display semantics
HP and MP in the profile are maximum character values. The game does not persist an out-of-battle current HP/MP value per character. Live battle HP/MP remain battle-session values and are shown in the battle UI.

## Compatibility
- Existing local save key and v20 save schema are unchanged.
- No migration or resource grant is required.
- PWA cache bumped to v7.
- Chinese, Japanese, and English are supported.

## Acceptance checklist
- Home party card tap opens the correct character.
- Formation party and owned-card taps open the correct character.
- Close action returns to the previous screen without changing formation.
- Place action assigns the character to the selected slot and closes the dialog.
- Equipment name and stat modifiers match Forge.
- Skill names, targets, costs, and effect values match static skill definitions.
- Empty equipment state is displayed correctly.
- Android narrow viewport can scroll through the full profile.
- Existing saves load without modification.
