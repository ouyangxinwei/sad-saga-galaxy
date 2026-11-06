# V0.76 — Abnormal Status System Phase 4

- Release date: 2026-11-07
- Branch: `standalone-migration`
- Scope: clearer in-battle status details and defensive indicators; no balance or persistent-save changes.

## Status details
- Active abnormal-status markers show the remaining battle rounds.
- Confusion markers also show the current Confusion level.
- Hover/focus tooltips explain each status effect in Chinese, Japanese, and English.

## Defensive information
- Allied units show equipment-based resistance percentages for supported ailments.
- Boss units show their configured status immunities as distinct indicators.
- Resistance and immunity remain separate mechanics: resistance lowers application chance; immunity rejects that status entirely.

## Compatibility and balance
- No status duration, status effect, application chance, equipment value, character progression, or battle damage formula is changed.
- No persistent save fields or migration are introduced.
- Existing battle simulation and combat rules are unchanged.

## Validation
- Phase 3 resistance test now uses a floating-point tolerance rather than strict decimal equality.
- Phase 4 tests cover localized status explanations and display data.
- Full combat tests, production build, and GitHub Pages deployment: pending.

## Commit and deployment
- Implementation commit: `df4dd262b0872b98e7fba64aaf4dd1f8af8edaab`
- Actions run: [#42294603292](https://github.com/ouyangxinwei/sad-saga-galaxy/actions/runs/42294603292)
- Deployment status: successful for implementation SHA `df4dd262b0872b98e7fba64aaf4dd1f8af8edaab`; build, validation, and GitHub Pages deploy jobs passed.
