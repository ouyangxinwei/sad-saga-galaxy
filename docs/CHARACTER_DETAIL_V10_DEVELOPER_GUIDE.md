# Character Detail V1.0 — Developer Guide

## Main files
- `src/components/dialogs/CharacterDetailDialog.jsx`: profile UI and derived data.
- `src/components/home/QuickFormation.jsx`: Home card click entry.
- `src/pages/Formation.jsx`: Scheme A card click behavior and slot assignment action.
- `src/pages/Forge.jsx`: accepts `?cardId=` to preselect the character.
- `src/lib/i18n.js`: character-detail localization keys.
- `src/lib/version.js`: v0.26 release notes.
- `public/sw.js`: shell cache v7.

## Derived data
Use existing selectors rather than duplicating formulas:
- `cardStats(game, cardId)` includes level/rebirth scaling and equipped relic modifiers.
- `relicOf(game, cardId)` resolves the equipped relic.
- `defOf(cardId)` resolves standard and custom character definitions.
- `classOf(def.classId)` resolves base/advanced class metadata.
- `def.skills` is a list of skill IDs; map through `SKILLS`.

## Interaction contract
- Card click opens details.
- Formation slot-number control changes the target slot.
- The profile's placement callback invokes the existing `actions.setPartySlot` through the existing `place` helper.
- Equipment shortcut navigates to Forge with the selected card ID in the query string.
- Closing the dialog is side-effect free.

## Constraints
- Do not persist temporary battle HP/MP in the profile.
- Do not modify the v20 save schema or local save key.
- Do not alter combat calculations.
- Keep all visible labels translated in zh/ja/en.
- Keep the dialog scrollable on narrow mobile screens.

## Verification
Run:
```bash
npm run validate:version
npm run lint
npm run typecheck
npm run build
```
Then manually test Home, Formation slot selection, place action, Forge preselection, empty relic, advanced classes, custom converted characters, and all three languages on a narrow Android viewport.
