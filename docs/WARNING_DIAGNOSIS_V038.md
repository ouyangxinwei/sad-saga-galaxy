# V0.38 — Automated Warning Diagnosis

## Purpose
Add a safe diagnostic workspace to the existing Debug Console. The tool combines real gameplay warning records with isolated, repeatable battle simulations. It does not automatically rewrite source code.

## Main correction
Equipment trigger outcomes `chance_failed`, `cooldown`, `per_turn_limit`, and `effect_not_applicable` are normal control-flow outcomes. They were previously emitted as WARN, making routine gameplay appear unhealthy. They are now INFO records.

## Simulation coverage
- Basic battle and turn progression.
- Skill selection and healing.
- Equipment effects: bonus damage, counter, battle-start shield, and MP restoration.
- Trigger chance failure, cooldown, and per-turn limit paths.
- Four repeatable scenarios use temporary units and do not call save/persist APIs. Equipment-trigger rolls use a fixed random stream; ordinary battle damage retains its normal randomness.

## Warning capture and analysis
- Captures application-issued `console.warn` calls (excluding the logger's own mirrored warning output).
- Groups records by module, function, event, and reason/message.
- Displays occurrence count, sample details, category, and repair guidance.
- Distinguishes expected equipment skips, runtime Console warnings, slow operations, and warnings requiring manual review.

## Test-environment safety
- The logger skips browser storage writes when running outside a browser, avoiding misleading storage-unavailable console messages in Node-based tests.

## Isolation and retention
- Simulation logger output is captured in memory and is not written to the normal 2,000-entry execution log.
- Diagnosis reports use a separate local-storage key and retain up to 20 reports.
- Export is JSON. The diagnostic tool does not alter game saves, resources, equipment, or progression.

## Limits
The simulation covers explicitly defined, repeatable battle paths, not every possible player action, device, browser extension, or browser-internal diagnostic. Browser-generated messages that do not call the page's `console.warn` API cannot be intercepted by page JavaScript. A clean simulation is not proof that all gameplay paths are warning-free. Repair recommendations are diagnostic guidance, not automatic source changes.

## Player guide
Open Settings → Debug Console → Warning Diagnosis, then select Run Warning Simulation. Review the scenario results and the grouped real-gameplay warnings. Reports can be exported as JSON; the latest 20 reports are retained separately from the game save.

## Developer guide
Scenario definitions and classifiers live in `src/lib/warningDiagnosis.js`; UI in `src/components/debug/WarningDiagnosis.jsx`; tests in `scripts/warning-diagnosis.test.mjs`. Extend scenarios with temporary units only. Do not call GameContext mutation actions, save persistence, resource grants, or progression APIs from the simulator. Run `npm run test:equipment` and `npm run build` before deployment.
