import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextStageAfterWin, getProgressAfterStageWin } from '../src/lib/stageProgression.js';

const campaignModes = ['normal', 'hard', 'nightmare'];

for (const mode of campaignModes) {
  test(`${mode}: a non-boss win advances by one stage`, () => {
    assert.equal(getProgressAfterStageWin(2, 3, false), 3);
    assert.equal(getNextStageAfterWin(mode, 3, false), 4);
  });

  test(`${mode}: defeating each fifth-stage boss unlocks the next five-stage block`, () => {
    assert.equal(getProgressAfterStageWin(4, 5, true), 9);
    assert.equal(getNextStageAfterWin(mode, 5, true), 10);
    assert.equal(getProgressAfterStageWin(9, 10, true), 14);
    assert.equal(getNextStageAfterWin(mode, 10, true), 15);
  });
}

test('boss progression requires the current sequential stage and never skips the boss', () => {
  assert.equal(getProgressAfterStageWin(3, 5, true), 3);
  assert.equal(getNextStageAfterWin('hard', 4, false), 5);
});

test('the final boss progression is capped at stage 100', () => {
  assert.equal(getProgressAfterStageWin(99, 100, true), 100);
  assert.equal(getNextStageAfterWin('nightmare', 100, true), 100);
});

test('tower and event battles do not use campaign next-stage progression', () => {
  assert.equal(getNextStageAfterWin('tower', 5, true), null);
  assert.equal(getNextStageAfterWin('event', 5, true), null);
});
