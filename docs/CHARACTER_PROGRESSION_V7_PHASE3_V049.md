# V7 Phase 3 — Main-character teamwide stat bonus (V0.49)

## Scope
- Branch: `standalone-migration`.
- Applies the confirmed teamwide +3% rule to actual allied battle units.
- Main-character level is the existing player progression field `state.level`.
- No save-schema change, cloud save, or save reset.

## Confirmed rule
- Main-character level 1 is the baseline.
- Each main-character level gained adds 3% to the teamwide multiplier.
- Formula: `1 + (main character level - 1) × 0.03`.
- Every deployed party member receives the same multiplier exactly once.
- Party-member individual character levels do not contribute to this multiplier.
- Changing the party automatically recalculates the bonus from the same main-character level.

## Applied battle attributes
- HP, ATK, DEF, and MP are multiplied by the teamwide factor.
- SPD, critical rate, skill effects, and MP costs are unchanged.
- Existing player-level scaling, career growth, breakthrough flat rewards, equipment bonuses, and fortune effects remain separate calculation layers.
- The teamwide multiplier is applied in `partyUnits`, not in `cardStats`, to avoid applying it repeatedly in character details or other stat callers.
- Team HP/MP totals are calculated from the same battle units and therefore include the bonus once.
- The existing player-level stat multiplier is preserved; the new +3% teamwide bonus is an additional independent layer.

## Regression tests
- Level 1 baseline and exact 3% per-level formula.
- All deployed party members receive the same HP/ATK/DEF/MP multiplier.
- SPD and critical rate remain unchanged.
- Party-member character levels do not affect the teamwide multiplier.
- Team HP/MP summary matches the resulting battle units and does not double-apply the bonus.

## Release
- App V0.49 / package 0.49.0.
- Service worker cache v31.
- Deployment is complete only after successful GitHub Actions tests, production build, Pages deployment, and matching deployed commit SHA.
