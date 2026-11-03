# V0.41 — Character progression save schema (Phase 1)

## Scope

This release adds the persistence foundation for the two-layer progression system. It does not yet grant character EXP, change battle attributes, add progression UI, or implement breakthroughs.

## Save structure

`characterProgression` is stored alongside the existing v20 save:

```js
{
  schemaVersion: 1,
  instances: {
    "card:lise:1": {
      instanceId: "card:lise:1",
      cardId: "lise",
      instanceNumber: 1,
      level: 1,
      exp: 0,
      breakthroughCount: 0,
      levelCap: 60
    }
  }
}
```

Each physical copy is represented by its own `instanceId`, even when several instances share the same `cardId`. Legacy migration uses the existing `cardCounts` value to create one independent level-1 record per owned copy.

## Migration and safety

- Migration runs when a legacy save is loaded and is idempotent.
- New owned cards and additional copies receive progression records when game state is committed.
- Existing progression values are preserved.
- Orphaned records are retained by this phase; later fusion/removal work must explicitly consume the selected instances.
- Player-wide level/EXP, equipment, resources, and the V13 one-time test-support marker are unchanged.
- Reset uses the existing default-state path, so progression records start fresh after Reset Game.

## Deliberately deferred

- Battle and idle EXP allocation.
- Per-card HP/ATK/DEF/MP growth.
- Party-wide +3% per-level multiplier.
- Breakthrough materials, costs, and level-cap increases.
- Card instance selection in party/formation UI and explicit instance consumption during fusion.
