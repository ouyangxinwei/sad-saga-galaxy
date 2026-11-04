# Idle System V2.0 — v0.54

## Rules
- New saves and legacy saves upgraded to this release receive 1,000 Idle Gems through the default-state merge; existing balances are preserved.
- Each successful battle has a 30% chance to grant one Idle Gem. Each failed battle has a 15% chance to grant one.
- Idle Gem batches are 10 or 20. If the balance is lower than the selected batch, all remaining gems are used. One gem equals one settlement of the currently accrued idle interval.
- The existing 5-minute minimum and 12-hour accrual cap remain.
- Idle checkpoint is the highest unlocked point in the accessible campaign modes. Before the first boss, the player may farm up to ordinary stage 4. After a boss is defeated, the corresponding multiple-of-five checkpoint becomes the idle location. Entering or losing to a boss does not unlock it.
- Idle farming repeats the selected checkpoint and does not modify campaign progress. It cannot skip or defeat a boss.
- Gold and EXP rates scale using the selected idle checkpoint's global tier and existing party passives.
- Each simulated idle clear grants 1–2 enemy shards for the first enemy in that checkpoint's stage definition.
- The settlement result shows settlement count, Idle Gems spent, gold, EXP, enemy-shard materials, and level-ups.
- Local save schema remains V20. New fields are default-merged into legacy saves: idleGems, idleGemStats, idleGemHistory.

## Validation
- Unit tests cover pre-boss limits, boss checkpoint unlocks, stage 70/75 examples, and batch spending.
- Battle drop rates and idle settlement behavior require runtime/manual validation in the deployed browser.
- Verify Chinese/Japanese/English labels and narrow mobile layout.
