import test from 'node:test';
import assert from 'node:assert/strict';
import { RESET_GEMS, RESET_TICKETS, createResetState, persistResetState } from '../src/lib/resetState.js';

test('every reset state starts with exactly 9999 summon gems and tickets', () => {
  const fresh = createResetState({ gems: 1500, tickets: 12, level: 1, exp: 0, progress: { normal: 0, hard: 0, nightmare: 0 } });
  assert.equal(RESET_GEMS, 9999);
  assert.equal(RESET_TICKETS, 9999);
  assert.equal(fresh.gems, 9999);
  assert.equal(fresh.tickets, 9999);
  assert.equal(fresh.level, 1);
  assert.deepEqual(fresh.progress, { normal: 0, hard: 0, nightmare: 0 });
});

test('reset persists both resource balances without clearing the test-support marker', () => {
  const values = new Map([['oooo_v13_test_support_v1', '{"claimedAt":1}']]);
  const storage = { setItem: (key, value) => values.set(key, value) };
  const fresh = createResetState({ gems: 10, tickets: 1, level: 1 });
  assert.equal(persistResetState(storage, 'saga_galaxy_save_v20', fresh), true);
  const saved = JSON.parse(values.get('saga_galaxy_save_v20'));
  assert.equal(saved.gems, 9999);
  assert.equal(saved.tickets, 9999);
  assert.ok(values.has('oooo_v13_test_support_v1'));
});

test('failed reset persistence returns false without claiming success', () => {
  const storage = { setItem: () => { throw new Error('quota exceeded'); } };
  assert.equal(persistResetState(storage, 'saga_galaxy_save_v20', createResetState({ gems: 1, tickets: 1 })), false);
});
