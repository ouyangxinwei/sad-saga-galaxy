import test from 'node:test';
import assert from 'node:assert/strict';
import { getCompletedIdleHours, rollIdleResourceDrops } from '../src/lib/idleRewards.js';

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
test('hourly auto settlement has no 12-hour cap and retains fractional time', () => {
  assert.equal(getCompletedIdleHours(3599), 0);
  assert.equal(getCompletedIdleHours(3600), 1);
  assert.equal(getCompletedIdleHours(12 * 3600), 12);
  assert.equal(getCompletedIdleHours(48 * 3600 + 3599), 48);
});

test('each non-idle gem resource receives an independent 30% roll per hour', () => {
  const values = [0.1, 0.9, 0.2, 0.8, 0.1, 0.7];
  const drops = rollIdleResourceDrops(2, () => values.shift());
  assert.deepEqual(drops, { gems: 1, clearGems: 1, tickets: 1 });
  assert.deepEqual(rollIdleResourceDrops(1, () => 0.31), { gems: 0, clearGems: 0, tickets: 0 });
  assert.deepEqual(rollIdleResourceDrops(1, () => 0.29), { gems: 1, clearGems: 1, tickets: 1 });
});

test('batch spending supports only 10 or 20 and caps at owned gems', () => {
  assert.equal(batchSpend(100, 10), 10);
  assert.equal(batchSpend(100, 20), 20);
  assert.equal(batchSpend(15, 20), 15);
  assert.equal(batchSpend(5, 10), 5);
  assert.equal(batchSpend(5, 20), 5);
  assert.equal(batchSpend(0, 20), 0);
});
