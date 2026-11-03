# V0.38 Developer Guide — Warning Diagnosis

## Files
- `src/lib/warningDiagnosis.js`: scenario definitions, isolated simulation, warning classification, grouping, and report history.
- `src/components/debug/WarningDiagnosis.jsx`: diagnostic UI.
- `src/lib/logger.js`: isolated diagnostic collector and runtime console warning capture.
- `src/lib/battle.js`: normal equipment trigger skip outcomes are INFO, not WARN.
- `src/pages/Debug.jsx`: Debug Console tab integration.
- `scripts/warning-diagnosis.test.mjs`: classification, grouping, and simulation tests.

## Extending scenarios
Add temporary ally/enemy definitions to `runWarningSimulation`. Do not import or call GameContext mutation actions, save persistence, resource grants, or local game progression from simulation scenarios. Prefer deterministic `options.random` values for equipment trigger paths.

## Classification policy
Normal expected trigger outcomes are INFO. Runtime Console warnings, slow operations, and unclassified application warnings remain reviewable. Do not silence a warning solely because it is frequent.

## Logger isolation
`captureDiagnosticLogs` temporarily intercepts SagaLogger writes while a simulation is running. It returns captured WARN/ERROR records and restores the previous collector in a finally block. Avoid overlapping diagnostic sessions.

## Runtime Console capture
`installConsoleWarningCapture` wraps `console.warn`, forwards to the original console, and stores application-issued warnings in the normal debug log. It ignores the logger's own `[SagaLogger]` mirror to prevent duplicate entries. Browser-internal warnings that do not invoke page JavaScript are outside this capture boundary.

## Verification
Run `npm run test:equipment` and `npm run build`. The release workflow runs equipment, battle, balance, and warning diagnosis tests before deployment.
