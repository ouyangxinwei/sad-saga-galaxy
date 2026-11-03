import test from 'node:test';
import assert from 'node:assert/strict';
import { resetState, replaceSave, RESET_GEMS, SAVE_KEY } from '../src/lib/save.js';

test('every reset state starts with exactly 9999 summon gems', () => {
  const fresh = resetState();
  assert.equal(RESET_GEMS, 9999);
  assert.equal(fresh.gems, 9999);
  assert.equal(fresh.level, 1);
  assert.equal(fresh.exp, 0);
  assert.equal(fresh.rebirth, 0);
  assert.deepEqual(fresh.progress, { normal: 0, hard: 0, nightmare: 0 });
});

test('reset writes the fresh state and does not clear the test-support marker', () => {
  const previous = globalThis.localStorage;
  const values = new Map([['oooo_v13_test_support_v1', '{"claimedAt":1,"expiresAt":9999999999999}']]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  try {
    const fresh = resetState();
    assert.equal(replaceSave(fresh), true);
    assert.equal(JSON.parse(values.get(SAVE_KEY)).gems, 9999);
    assert.ok(values.has('oooo_v13_test_support_v1'));
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});

test('failed reset persistence returns false without claiming success', () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = { setItem: () => { throw new Error('quota exceeded'); } };
  try { assert.equal(replaceSave(resetState()), false); }
  finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});
