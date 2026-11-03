# V0.39 Developer Guide — Reset Game

- `src/lib/save.js`: `RESET_GEMS = 9999`, `resetState()`, and `replaceSave(state)`.
- `src/lib/GameContext.jsx`: reset action builds a fresh reset state, persists it first, and only then updates the in-memory React state.
- `src/pages/Settings.jsx`: closes the confirmation UI only when `resetSave()` returns true.
- `scripts/reset.test.mjs`: checks default progression, exact gem count, save write, V13 marker retention, and storage failure.
- The test-support marker `oooo_v13_test_support_v1` must not be removed by Reset Game; otherwise the one-time grant could be issued again.
- The ordinary new-profile starting gem balance remains unchanged. Do not change `defaultStateImpl().gems` unless the product requirement changes.
