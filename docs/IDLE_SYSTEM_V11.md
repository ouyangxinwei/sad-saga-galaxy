# Sad Saga Galaxy — Idle System V1.1 / v0.25

## Confirmed rules
- Scope: all five current party slots; empty slots and unowned/invalid cards do not contribute.
- Stacking: additive by reward category.
- Existing main idle loop: retained; no expedition mode or technology tree is introduced.
- Balance: moderate class bonuses.

## Class passives
| Class | Effect |
|---|---|
| Sword | Gold +5% |
| Guardian | Gold +5% |
| Lancer | Main-stage progress +5% |
| Archer | Main-stage progress +5% |
| Mage | EXP +5% |
| Priest | EXP +5% |
| Rogue | Gold +5% |
| Alchemist | EXP +5% |
| Stargazer | Gold +3%, EXP +3%, progress +3% |

Bonuses from the current party add by category. Each category is capped at +25%. Ascended classes inherit their base class passive. Converted/custom cards use their resolved class. Combat passives are not reused.

## Reward calculation
- Base rates continue to depend on highest cleared tier using existing formulas.
- Final gold and EXP hourly rates are rounded from base rate × (1 + category bonus).
- Main progression rate is 5 × (1 + progress bonus) stages/hour; integer stage claims are calculated from elapsed seconds.
- Existing limits remain: 12-hour accrual cap, 5-minute minimum claim, maximum 8 stage advances per claim.
- No new gems, tickets, equipment, relic, or shard drops.

## Accrual and party changes
- Current party bonuses are used for preview and claim; changing formation changes the bonus for the entire unclaimed interval (no historical party snapshot).
- Pausing freezes accrued seconds; resuming continues from saved accrual.
- Paused accrued time can be claimed. Claims subtract only claimed elapsed seconds.
- Reaching the 12-hour cap resets the accrual anchor after claim to prevent duplicate payout.
- Existing v20 saves receive idle.elapsedSeconds=0 through the existing state merge. Save key remains saga_galaxy_save_v20.

## UI and localization
Idle dialog shows aggregate gold/EXP/progress bonuses and each contributing member's passive. Chinese, Japanese, and English are supported.

## Validation checklist
1. Five-member mixed party: verify each class bonus and additive category totals.
2. Empty slot, unowned ID, missing/custom invalid definition: no bonus and no crash.
3. Ascended classes: inherit base class passive.
4. Gold/EXP hourly rates round correctly; progress advances at fractional hourly rate.
5. Five-minute threshold, 12-hour cap, 8-stage cap, and all-300-stages completion boundary.
6. Pause after elapsed time, claim while paused, resume, and claim again: no time loss or duplicate rewards.
7. Upgrade existing v20 save and verify all existing resources/progress remain unchanged.
8. Switch zh/ja/en and verify every new label.
9. Verify mobile layout and PWA cache refresh.
