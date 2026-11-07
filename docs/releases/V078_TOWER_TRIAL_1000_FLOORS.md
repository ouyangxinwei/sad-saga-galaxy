# V0.78 — Tower Trial: 1,000-floor continuous challenge

## Confirmed implementation rules
- Maximum floor: 1,000.
- Compound difficulty: enemy scale is multiplied by `1.01 ** (floor - 1)`; floor 1 is the baseline.
- The resulting scale affects enemy HP, ATK, DEF and SPD through the existing `enemyStats` calculation. No battle-engine or status-system rewrite.
- After a win, the result panel offers a **Continue** action to the next floor. Progression is manual; no auto-advance.
- The current floor, whether a battle is in progress, and claimed milestone floors are stored in the existing V20 local save.
- Refreshing or leaving the battle route during an unfinished battle resumes the same floor without charging stamina a second time. Defeated battles can be retried normally.
- Every 100 cleared floors grants a one-time milestone bonus of 100 gems and 1 summon ticket, in addition to the ordinary floor reward.
- The existing highest-cleared tower record remains separate from the current run floor.
- Legacy saves are merged with defaults; no save reset and no save schema-version bump.
- Main branch remains untouched; work is confined to `standalone-migration`.

## Validation
- `scripts/tower-trial.test.mjs`: floor cap, compound multiplier, all four enemy attributes, endgame finite values, new-save defaults, and legacy-save normalization.
- GitHub Actions additionally runs existing formation, save progress, save backup, abnormal status/combat, production build and artifact smoke tests, then deploys Pages and verifies the live site with headless Chromium.
