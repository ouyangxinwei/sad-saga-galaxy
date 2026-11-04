# Formation System Phase 5 — Focused Acceptance

Date: 2026-11-04  
Release: v0.62  
Branch: `standalone-migration`

## Scope

This phase closes the current formation-system iteration with focused verification only. It does not run the full regression suite and does not expand the simplified Phase 3 demo into a complete implementation of all eight formations.

## Acceptance coverage

- Eight formation definitions each retain five unique, bounded visual positions.
- The default Balanced Ring and per-formation five-slot assignments normalize safely.
- Missing, duplicate, retired, and non-party character assignments are repaired or rejected without changing the party roster.
- Active formation chance bonuses are limited to assigned members and correctly distinguish standard Critical, Desperate Critical, and Desperate Dodge.
- Character details and battle-unit construction both call `getFormationCombatBonuses`; their displayed and applied chance adjustments therefore share the same source calculation.
- Existing Desperate Combat tests cover stable character-specific rates, strict below-20% / below-10% HP thresholds, one desperate-critical roll for a multi-hit skill, and independent incoming-hit dodge checks.
- V20 remains the local save schema; no cloud save or save migration is introduced.
- Chinese, Japanese, and English labels are present for the formation probability details. Mobile layout is retained from the existing responsive formation/detail components; this workflow does not claim physical-device visual QA.

## Deployment gate

GitHub Actions runs `npm run test:formation`, `npm run test:combat`, and the production build (including version-catalog validation) before deploying the Pages artifact. A successful deployment is required before this phase is considered published.

## Explicitly out of scope

Formation stat multipliers, damage reduction, MP and skill modifiers, action ordering, follow-up critical conditions, and conditional high-speed dodge remain informational previews. Full regression testing and a full mobile-device QA pass are intentionally skipped per the project decision.
