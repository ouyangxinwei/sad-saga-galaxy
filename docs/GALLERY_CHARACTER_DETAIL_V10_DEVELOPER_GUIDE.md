# Gallery Character Detail V1.0 — Developer Guide

## Files

- `src/components/dialogs/GalleryDialog.jsx`: owns selected hero ID and opens the shared detail dialog.
- `src/components/dialogs/CharacterDetailDialog.jsx`: shared detail UI and existing stat/equipment/skill presentation.
- `src/lib/cards.js`: existing `cardStats`, `relicOf`, and card calculation helpers.
- `src/lib/version.js`: v0.27 release notes.
- `package.json`: package version 0.27.0.
- `public/sw.js`: PWA cache version v8.

## Implementation

The Gallery maintains a local `selectedHeroId` state. Owned hero `CardTile` instances receive an `onClick` callback that sets this ID. Locked hero cards receive no callback, so their existing disabled behavior remains intact.

The `CharacterDetailDialog` is rendered alongside the Gallery modal. Its `open` state is derived from whether a hero ID is selected. Closing it clears the selected ID. The Gallery's tab and filter state are not reset.

## Design constraints

- Reuse `CharacterDetailDialog`; do not duplicate attribute or skill calculations.
- Do not change enemy Gallery cards.
- Do not modify save data, combat behavior, or progression.
- Keep the same shared dialog language behavior for Chinese, Japanese, and English.

## Suggested verification

- Open details for multiple owned heroes and verify each selected ID is shown.
- Confirm locked heroes cannot open details.
- Confirm the current tab and filter remain selected after closing details.
- Confirm enemy Gallery cards behave as before.
- Check the dialog on a narrow mobile viewport and in all three supported languages.
- Run `npm run validate:version`, `npm run lint`, `npm run typecheck`, and `npm run build`.
