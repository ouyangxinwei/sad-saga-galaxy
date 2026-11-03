# Character Progression Phase 4 — Card Fusion Growth Handling (V0.44)

## Confirmed behavior
- Existing rarity fusion remains unchanged: 3 same-type A cards become 1 S card; 3 same-type S cards become 1 SS card.
- Fusion consumes exactly three source copies.
- The progression records of the consumed source copies are removed with those copies. Their level, EXP, breakthrough count, and level cap are not transferred.
- Any already-owned fusion-result card retains its own progression records unchanged.
- If the fusion result was not previously owned, normalization creates its new progression record at the normal initial values.
- If more than three source copies exist, the three least-developed instances are consumed first (level, then EXP, then breakthrough count); stronger remaining copies are preserved.
- No player-level EXP, battle calculation, rarity cost, or unrelated save data is changed.

## Implementation
- Added `consumeFusedCharacterInstances(state, cardId, count)` to the character progression data layer.
- Integrated the helper into `fuseCards` before source inventory counts are updated.
- Kept the existing save schema and normalization behavior; no save reset or migration key change.
- Updated fusion instructions in Chinese, Japanese, and English.
- Added tests for source-record removal, result-record preservation, and protecting stronger leftover copies.

## Validation
- `npm run test:equipment`
- `npm run build`
- GitHub Actions deploy workflow on `standalone-migration`.
