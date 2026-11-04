import test from 'node:test';
import assert from 'node:assert/strict';
import { getClearGemSettlementCount, isStageCleared, normalizeClearGemBatch } from '../src/lib/clearGemSystem.js';

test('quick clear only accepts the supported 10 or 20 batch sizes', () => {
  assert.equal(normalizeClearGemBatch(10), 10);
  assert.equal(normalizeClearGemBatch(20), 20);
  assert.equal(normalizeClearGemBatch(5), 10);
});

test('quick clear batch is capped by the independent clear gem balance', () => {
  assert.equal(getClearGemSettlementCount(30, 10), 10);
  assert.equal(getClearGemSettlementCount(30, 20), 20);
  assert.equal(getClearGemSettlementCount(7, 20), 7);
  assert.equal(getClearGemSettlementCount(0, 10), 0);
  assert.equal(getClearGemSettlementCount(-3, 20), 0);
});

test('quick clear can target only stages already cleared in the selected difficulty', () => {
  assert.equal(isStageCleared(0, 1), false);
  assert.equal(isStageCleared(12, 1), true);
  assert.equal(isStageCleared(12, 12), true);
  assert.equal(isStageCleared(12, 13), false);
  assert.equal(isStageCleared(12, 0), false);
});
