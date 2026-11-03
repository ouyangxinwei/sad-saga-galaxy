# V0.40 Developer Guide — Reset Game

- src/lib/resetState.js exports RESET_GEMS = 9999 and RESET_TICKETS = 9999. createResetState applies both values to the fresh state.
- src/lib/save.js delegates reset-state creation and persistence to resetState.js.
- src/lib/GameContext.jsx persists the reset state first and updates React state only after a successful write.
- src/pages/Settings.jsx closes the confirmation UI only when actions.resetSave() returns true.
- scripts/reset.test.mjs checks both exact resource balances, default progression, persistence, V13 marker retention, and storage failure.
- The test-support marker oooo_v13_test_support_v1 must not be removed by Reset Game; otherwise the one-time grant could be issued again.
- Ordinary new-profile starting resource balances remain unchanged. Do not change defaultStateImpl() for this feature.
