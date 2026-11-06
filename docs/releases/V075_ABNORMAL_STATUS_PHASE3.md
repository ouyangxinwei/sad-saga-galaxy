# V0.75 — Abnormal Status System Phase 3

- Release date: 2026-11-07
- Branch: `standalone-migration`
- Scope: equipment ailment resistance and selected boss status immunities; no new persistent data or save migration.

## Equipment resistance
- Existing equipment contributes resistance through combat metadata.
- Resistance stacks across weapon, armor, and relic slots, independently for Poison, Blind, Paralysis, Sleep, and Confusion.
- Total resistance for each status is capped at 60%.
- Resistance affects only status application chance; damage and status duration/effects are unchanged.

## Boss immunities
- Only the lead enemy on every fifth-stage boss encounter receives a configured immunity; supporting enemies remain unaffected.
- Immunity is status-specific and varies by enemy type. Bosses are not immune to every ailment.
- Immune status applications are rejected before the status-proc random roll.

## Battle feedback
- Battle logs distinguish equipment resistance from boss immunity.
- Chinese, Japanese, and English messages are included.

## Compatibility
- No persistent save fields, equipment ownership, loadouts, character progression, stage rewards, or skill damage multipliers change.
- Existing saves derive resistance from equipment IDs already stored.

## Validation
- Focused tests cover resistance normalization, aggregation/capping, chance adjustment, immunity precedence, and boss-stage tagging.
- GitHub Actions validation: pending.

## Commit and deployment
- Implementation commit: pending
- Actions run: pending
- Deployment status: pending
