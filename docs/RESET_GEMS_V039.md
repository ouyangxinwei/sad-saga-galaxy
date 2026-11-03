# V0.40 — Reset Game Gem and Ticket Initialization

## Behavior
- Every explicit **Reset Game** action creates a fresh game state with exactly **9,999 summon gems** and **9,999 summon tickets**.
- Both values replace the pre-reset balances. All other values use the existing fresh-game initialization rules.
- Ordinary first-time new-game starting resources remain unchanged; the 9,999 values apply only to explicit Reset Game.
- The one-time V13 test-support marker is preserved. Resetting does not trigger another 324,000-gem / 450-ticket one-time grant.
- The auto-idle feature is not part of this release.

## Save safety
- Reset state is written to the existing local save key before React state is replaced.
- If localStorage write fails, the action returns false, the confirmation UI remains open, and the old in-memory and on-disk save remain intact.
- The reset writes atomically via localStorage.setItem; it does not remove the old save first.

## Validation
- scripts/reset.test.mjs checks both exact resource balances, fresh progression defaults, persistence, preservation of the V13 support marker, and write-failure behavior.
- Run npm run test:equipment and npm run build.

## Player steps
Open Settings → Reset Game → Confirm. The new game begins with 9,999 gems and 9,999 summon tickets. Repeat the same steps whenever you need another fresh test run.
