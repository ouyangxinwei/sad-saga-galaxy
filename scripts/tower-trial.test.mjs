import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_MAP, TOWER_MAX_FLOOR, TOWER_STAGE, enemyStats, getTowerDifficultyMultiplier } from '../src/lib/gameData.js';
import { defaultState, loadState, SAVE_KEY } from '../src/lib/save.js';

test('tower difficulty compounds by exactly 1% per floor and is capped at 1,000', () => {
  assert.equal(TOWER_MAX_FLOOR, 1000);
  assert.equal(getTowerDifficultyMultiplier(1), 1);
  assert.ok(Math.abs(getTowerDifficultyMultiplier(2) - 1.01) < 1e-12);
  assert.ok(Math.abs(getTowerDifficultyMultiplier(3) - 1.01 ** 2) < 1e-12);
  assert.ok(Math.abs(getTowerDifficultyMultiplier(1000) - 1.01 ** 999) < 1e-7);
  assert.equal(TOWER_STAGE(1001).n, 1000);
  assert.equal(TOWER_STAGE(0).n, 1);
});

test('tower enemy HP, ATK, DEF and speed all increase with the compound scale', () => {
  const floor1 = TOWER_STAGE(1);
  const floor2 = TOWER_STAGE(2);
  assert.ok(floor2.scale > floor1.scale);
  const enemy = ENEMY_MAP[floor1.enemies[0].enemyId];
  const first = enemyStats(enemy, floor1.enemies[0].scale);
  const second = enemyStats(enemy, floor1.enemies[0].scale * 1.01);
  for (const stat of ['hp', 'atk', 'def', 'spd']) assert.ok(second[stat] > first[stat], stat + ' should scale');
  const endgame = TOWER_STAGE(TOWER_MAX_FLOOR);
  const endgameStats = enemyStats(ENEMY_MAP[endgame.enemies[0].enemyId], endgame.enemies[0].scale);
  for (const stat of ['hp', 'atk', 'def', 'spd']) assert.ok(Number.isFinite(endgameStats[stat]), stat + ' must remain finite');
});

test('new saves include a clean tower run state', () => {
  assert.deepEqual(defaultState().towerRun, {
    active: false,
    inBattle: false,
    currentFloor: 1,
    claimedMilestones: [],
  });
});

test('legacy V20 saves are upgraded and tower run values are normalized safely', () => {
  const previousStorage = globalThis.localStorage;
  const oldSave = { ...defaultState() };
  delete oldSave.towerRun;
  let raw = JSON.stringify(oldSave);
  globalThis.localStorage = {
    getItem: (key) => key === SAVE_KEY ? raw : null,
    setItem: () => {},
    removeItem: () => {},
  };
  try {
    assert.deepEqual(loadState().towerRun, {
      active: false,
      inBattle: false,
      currentFloor: 1,
      claimedMilestones: [],
    });
    raw = JSON.stringify({
      ...oldSave,
      towerRun: { active: true, inBattle: true, currentFloor: 5001, claimedMilestones: [100, 101, 200] },
    });
    const restored = loadState();
    assert.equal(restored.towerRun.active, true);
    assert.equal(restored.towerRun.inBattle, true);
    assert.equal(restored.towerRun.currentFloor, 1000);
    assert.deepEqual(restored.towerRun.claimedMilestones, [100, 200]);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
