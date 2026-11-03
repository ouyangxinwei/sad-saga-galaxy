# Character Progression Phase 6 — UI and Comprehensive Regression (V0.46)

## UI corrections
- Character detail header now uses the character progression record's own level and cap, not the player's level/rebirth.
- Detail progression panel shows current EXP, next-level EXP requirement, remaining EXP, and a bounded progress bar.
- At the level cap, stored EXP is explicitly labeled and explained as waiting for breakthrough.
- Battle victory result distinguishes character EXP awarded to each deployed character from the player's EXP reward.
- Character details retain the safe-area-aware mobile bottom sheet. Battle result panel is now a scrollable mobile bottom sheet with safe-area padding.

## Regression coverage
- Existing progression policy, migration idempotence, duplicate instance independence, reserve exclusion, EXP curve, max-level storage, breakthrough cost/limit, breakthrough EXP settlement, and fusion inheritance tests remain.
- Added V20 legacy-save migration test preserving player level/EXP, currencies, party, progress, equipment, and card counts.
- Added party battle EXP test proving capped characters store EXP while non-capped characters level up, without changing player EXP.
- Added capped EXP retention boundary test.

## Compatibility / scope
- Save key and progression schema unchanged.
- No save reset, no combat-stat rebalance, no changes to player-level EXP rules or the five-character battle model.
- Updated release notes in Chinese, Japanese, and English.
- Browser cache shell version incremented to v28 so installed clients can fetch the new UI.
