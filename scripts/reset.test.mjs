import test from 'node:test';
import assert from 'node:assert/strict';
import { RESET_GEMS, createResetState, persistResetState } from '../src/lib/resetState.js';

test('every reset state starts with exactly 9999 summon gems', () => {
  const fresh = createResetState({ gems: 1500, level: 1, exp: 0, progress: { normal: 0, hard: 0, nightmare: 0 } });
  assert.equal(RESET_GEMS, 9999);
  assert.equal(fresh.gems, 9999);
  assert.equal(fresh.level, 1);
  assert.deepEqual(fresh.progress, { normal: 0, hard: 0, nightmare: 0 });
});

test('reset persists the fresh save without clearing the test-support marker', () => {
  const values = new Map([['oooo_v13_test_support_v1', '{"claimedAt":1}']]);
  const storage = { setItem: (key, value) => values.set(key, value) };
  const fresh = createResetState({ gems: 10, level: 1 });
  assert.equal(persistResetState(storage, 'saga_galaxy_save_v20', fresh), true);
  assert.equal(JSON.parse(values.get('saga_galaxy_save_v20')).gems, 9999);
  assert.ok(values.has('oooo_v13_test_support_v1'));
});

test('failed reset persistence returns false without claiming success', () => {
  const storage = { setItem: () => { throw new Error('quota exceeded'); } };
  assert.equal(persistResetState(storage, 'saga_galaxy_save_v20', createResetState({ gems: 1 })), false);
});
