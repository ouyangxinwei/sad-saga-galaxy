import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSaveProgress, getSaveProgress } from '../src/lib/save.js';

const save = (rebirth, level) => ({ rebirth, level });

test('extracts only top-level player rebirth and level', () => {
  assert.deepEqual(getSaveProgress({
    rebirth: 2,
    level: 60,
    characterProgression: { instances: { hero: { level: 999 } } },
  }), { rebirth: 2, level: 60 });
});

test('higher rebirth wins even when player level is lower', () => {
  assert.equal(compareSaveProgress(save(1, 10), save(0, 80)), 1);
  assert.equal(compareSaveProgress(save(2, 10), save(1, 80)), 1);
});

test('lower rebirth loses even when player level is much higher', () => {
  assert.equal(compareSaveProgress(save(2, 80), save(3, 10)), -1);
});

test('player level is compared only when rebirth counts are equal', () => {
  assert.equal(compareSaveProgress(save(2, 60), save(2, 50)), 1);
  assert.equal(compareSaveProgress(save(2, 50), save(2, 60)), -1);
});

test('equal rebirth and level are considered equal, not importable as an upgrade', () => {
  assert.equal(compareSaveProgress(save(2, 60), save(2, 60)), 0);
});

test('zero values are valid progress values', () => {
  assert.deepEqual(getSaveProgress(save(0, 0)), { rebirth: 0, level: 0 });
  assert.equal(compareSaveProgress(save(0, 1), save(0, 0)), 1);
});

test('missing, non-integer, negative, string, and unsafe values are rejected', () => {
  const invalidStates = [
    {},
    { rebirth: 0 },
    { level: 1 },
    save(-1, 1),
    save(0, -1),
    save(1.5, 1),
    save(1, 2.5),
    save('1', 2),
    save(1, '2'),
    save(Number.MAX_SAFE_INTEGER + 1, 1),
    null,
    [],
  ];

  for (const state of invalidStates) {
    assert.throws(() => getSaveProgress(state), { message: 'invalid-save-progress' });
  }
});

test('comparison rejects invalid progress on either side', () => {
  assert.throws(
    () => compareSaveProgress(save(1, 10), { rebirth: 0 }),
    { message: 'invalid-save-progress' },
  );
  assert.throws(
    () => compareSaveProgress({ rebirth: 1, level: '10' }, save(0, 80)),
    { message: 'invalid-save-progress' },
  );
});
