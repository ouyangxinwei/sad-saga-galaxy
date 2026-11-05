# Idle System V2.1 — v0.70

## Rules
- New saves and legacy saves upgraded to this release receive 1,000 Idle Gems through the default-state merge; existing balances are preserved.
- Each successful battle has a 30% chance to grant one Idle Gem. Each failed battle has a 15% chance to grant one.
- Idle Gem batches are 10 or 20. If the balance is lower than the selected batch, all remaining gems are used. One gem equals one settlement of the currently accrued idle interval.
- While idle is active, each completed hour is automatically settled and granted to the local save. There is no cumulative time cap; completed offline hours are processed when the game is reopened. The remainder below one hour continues accumulating.
- Idle checkpoint is the highest unlocked point in the accessible campaign modes. Before the first boss, the player may farm up to ordinary stage 4. After a boss is defeated, the corresponding multiple-of-five checkpoint becomes the idle location. Entering or losing to a boss does not unlock it.
- Idle farming repeats the selected checkpoint and does not modify campaign progress. It cannot skip or defeat a boss.
- Gold and EXP rates scale using the selected idle checkpoint's global tier and existing passives from the five characters in the current party. Each hour independently rolls 30% for Gems, Clear Gems, and summon Tickets; each successful resource roll grants +1. These rolls are independent, so multiple resource types may drop in one hour. Idle Gems are excluded from automatic drops.
- Automatic hourly settlement does not spend Idle Gems. The existing manual 10/20-batch settlement remains available and continues to spend Idle Gems.
- Each simulated idle clear grants 1–2 enemy shards for the first enemy in that checkpoint's stage definition.
- Manual batch settlement continues to show settlement count, Idle Gems spent, gold, EXP, enemy-shard materials, and level-ups. Automatic hourly settlement is applied directly to the V20 local save.
- Local save schema remains V20. Legacy saves are default-merged as before; the clear-gem statistics gain an optional `earnedFromIdle` counter.

## Validation
- Unit tests cover pre-boss limits, boss checkpoint unlocks, stage 70/75 examples, and batch spending.
- Battle drop rates and idle settlement behavior require runtime/manual validation in the deployed browser.
- Verify Chinese/Japanese/English labels and narrow mobile layout.
