import test from 'node:test';
import assert from 'node:assert/strict';

function idleStage(progress, modeIndex = 0) {
  const cleared = Math.max(0, Math.min(100, Math.floor(Number(progress) || 0)));
  const stage = cleared >= 100 ? 100 : cleared >= 9 ? Math.floor(cleared / 5) * 5 : Math.min(4, cleared + 1);
  return modeIndex * 100 + Math.max(1, stage);
}
function batchSpend(balance, requested) {
  return Math.min(Math.max(0, Math.floor(balance)), [10, 20].includes(requested) ? requested : 1);
}

test('idle checkpoint stays before an undefeated first boss', () => {
  assert.equal(idleStage(0), 1);
  assert.equal(idleStage(2), 3);
  assert.equal(idleStage(3), 4);
  assert.equal(idleStage(4), 4);
});
test('only cleared fifth-stage bosses unlock their idle checkpoint', () => {
  assert.equal(idleStage(9), 5);
  assert.equal(idleStage(14), 10);
  assert.equal(idleStage(74), 70);
  assert.equal(idleStage(79), 75);
  assert.equal(idleStage(100), 100);
});
test('batch spending supports only 10 or 20 and caps at owned gems', () => {
  assert.equal(batchSpend(100, 10), 10);
  assert.equal(batchSpend(100, 20), 20);
  assert.equal(batchSpend(15, 20), 15);
  assert.equal(batchSpend(5, 10), 5);
  assert.equal(batchSpend(5, 20), 5);
  assert.equal(batchSpend(0, 20), 0);
});
