# V0.39 — Reset Game Gem Initialization

## Behavior
- Every explicit **Reset Game** action creates a fresh game state with exactly **9,999 summon gems**.
- All other values use the existing `defaultState` initialization rules. The previous gem balance is never carried forward.
- The regular new-browser initial balance remains unchanged; 9,999 applies to the explicit in-game reset operation.
- The one-time V13 test-support marker is preserved. Resetting does not trigger another 324,000-gem / 450-ticket one-time grant.
- Existing equipment, battle, warning diagnosis, and save schema behavior remain unchanged.

## Save safety
- Reset state is written to the existing local save key before React state is replaced.
- If localStorage write fails, the action returns false, the UI remains in the confirmation state, and the old in-memory state is retained.
- The reset writes atomically via `localStorage.setItem`; it does not remove the old save first.

## Validation
- `scripts/reset.test.mjs` checks the exact 9,999 balance, fresh progression defaults, persistence, preservation of the V13 support marker, and write-failure behavior.
- Run `npm run test:equipment` and `npm run build`.

## Player steps
Open Settings → Reset Game → Confirm. The new game begins with 9,999 gems. Repeat the same steps whenever you need another fresh test run.
