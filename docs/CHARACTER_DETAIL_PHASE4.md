# Phase 4 — Character Detail Probability Display

## Scope
- Make the character profile's ordinary critical, desperate critical, and desperate dodge values traceable to their sources.
- Prefer the same computed battle-unit values used by combat when the character is in the active party.
- Show character base chance, effective equipment contribution, fortune bonus, and formation bonus separately for ordinary critical chance.
- Show base and formation contributions for desperate critical and desperate dodge.
- Keep high-speed dodge and Long Serpent follow-up critical as conditional formation effects; do not fold them into permanent chance values when their conditions are not active.
- Display the existing combat caps: ordinary critical 75%, desperate critical 35%, desperate dodge 45%.
- Keep the HP trigger thresholds visible: below 20% for desperate critical and below 10% for desperate dodge.

## Compatibility
- Read-only display changes; no combat balance or character progression changes.
- No V20 local-save schema or save-key changes.
- Chinese, Japanese, and English labels remain in sync.
- Mobile layout continues to use the existing scrollable character detail modal.

## Focused verification
- Unit tests cover chance-source arithmetic, battle-unit value precedence, conditional bonuses, and probability caps.
- Deployment continues to run the formation and combat focused tests plus production build.
- Full regression testing remains out of scope.
