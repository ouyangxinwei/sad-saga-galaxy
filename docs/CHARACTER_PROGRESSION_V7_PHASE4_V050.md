# V7 Phase 4 — Character details, breakthrough and fusion previews (V0.50)

## Scope
- Branch: `standalone-migration`.
- UI and preview improvements only; no save-schema change.
- Chinese, Japanese, and English are supported.

## Character detail: stat-source breakdown
The character detail dialog now separates:
- Main character/player level and the teamwide battle bonus derived from it.
- Career growth by HP, ATK, DEF, and MP, based on that card's strongest progression instance.
- Cumulative flat breakthrough rewards (HP, ATK, DEF, MP).
- Equipment bonuses (HP, ATK, DEF, SPD, and crit).
The teamwide bonus is displayed as a battle-only team bonus and is not folded into the character's standalone `cardStats` display, preventing confusion or double application.

## Formation
- Shows main character level and the exact teamwide battle bonus above the party slots.
- Uses the same `mainCharacterTeamBonusMultiplier` helper as battle-unit construction.
- The display updates from current game state and does not depend on party-member levels.

## Breakthrough preview
- Shows the next level-cap increase (+10).
- Shows the next fixed career-specific reward.
- Shows cumulative breakthrough rewards already recorded.
- Existing max-level requirement, escalating shard/gold costs, level retention, stored EXP handling, and unlimited breakthrough policy are unchanged.

## Fusion preview
- Compares the three weakest source copies that the existing fusion action will consume against all existing result-card progression copies.
- Uses the same ordering criteria as the fusion policy: level, EXP, breakthrough count, level cap; exact ties prefer the existing result copy.
- If a consumed source record wins, the new result copy inherits its complete progression record, including breakthrough bonuses.
- If an existing result copy wins, it remains unchanged and the newly fused copy starts at Lv1 with its initial cap.
- The preview is informational; it does not consume cards, materials, or resources.

## Tests
- Adds tests that the fusion preview selects the same winner policy for source-vs-result records.
- Adds tests for separate stat-source values: main level/team bonus, career growth, breakthrough rewards, and equipment.
- Existing progression, battle, save migration, and fusion tests remain in the workflow.

## Release
- App V0.50 / package 0.50.0.
- Service worker cache v32.
- Deployment is complete only after successful GitHub Actions tests, production build, Pages deployment, and matching deployed commit SHA.
