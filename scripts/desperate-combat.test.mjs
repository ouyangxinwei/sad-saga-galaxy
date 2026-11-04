import test from 'node:test';
import assert from 'node:assert/strict';
import { HEROES, heroStats } from '../src/lib/gameData.js';
import { simulateBattle } from '../src/lib/battle.js';
import {
  DESPERATE_COMBAT_RULES,
  getDesperateCombatRates,
  canTriggerDesperateCrit,
  canTriggerDesperateDodge,
  rollDesperateCrit,
  rollDesperateDodge,
} from '../src/lib/desperateCombat.js';

test('all 20 base heroes receive unique, stable rates within the approved range', () => {
  assert.equal(HEROES.length, 20);
  const ratePairs = new Set();
  let baseRateTotal = 0;
  for (const hero of HEROES) {
    const def = { ...hero, stats: heroStats(hero) };
    const first = getDesperateCombatRates(hero.id, def);
    const refreshed = getDesperateCombatRates(hero.id, {
      ...def,
      level: 999,
      equipment: [{ id: 'test-equipment', stats: { atkPct: 9, hpPct: 9 } }],
      temporaryBuffs: { atk: 999, def: 999 },
    });
    assert.deepEqual(first, refreshed, `${hero.id} rates must remain stable across progression and equipment changes`);
    assert.ok(first.desperateCritRate >= .1 && first.desperateCritRate <= .3);
    assert.ok(first.desperateDodgeRate >= .1 && first.desperateDodgeRate <= .3);
    assert.ok(Math.abs(first.desperateCritRate - first.baseRate) <= .0200001);
    assert.ok(Math.abs(first.desperateDodgeRate - first.baseRate) <= .0200001);
    ratePairs.add(`${first.desperateCritRate.toFixed(8)}:${first.desperateDodgeRate.toFixed(8)}`);
    baseRateTotal += first.baseRate;
  }
  assert.equal(ratePairs.size, 20, 'each of the 20 base heroes must have its own crit/dodge rate pair');
  assert.ok(Math.abs(baseRateTotal / HEROES.length - .2) < 1e-10, 'roster-average baseline must remain 20%');
  assert.equal(DESPERATE_COMBAT_RULES.randomAdjustment, .02);
});

test('higher initial ability lowers the base desperate-combat rate', () => {
  const keys = ['hp', 'atk', 'def', 'spd', 'mp'];
  const roster = HEROES.map((hero) => heroStats(hero));
  const average = Object.fromEntries(keys.map((key) => [
    key,
    roster.reduce((sum, stats) => sum + stats[key], 0) / HEROES.length,
  ]));
  const weak = Object.fromEntries(keys.map((key) => [key, average[key] * .5]));
  const strong = Object.fromEntries(keys.map((key) => [key, average[key] * 1.5]));
  const weakRate = getDesperateCombatRates('weak-test', { stats: weak });
  const strongRate = getDesperateCombatRates('strong-test', { stats: strong });
  assert.equal(weakRate.baseRate, .3);
  assert.equal(strongRate.baseRate, .1);
  assert.ok(weakRate.baseRate > strongRate.baseRate);
});

test('desperate critical threshold is strictly below 20 percent and excludes dead units', () => {
  assert.equal(canTriggerDesperateCrit({ side: 'ally', alive: true, hp: 20, maxHp: 100 }), false);
  assert.equal(canTriggerDesperateCrit({ side: 'ally', alive: true, hp: 19, maxHp: 100 }), true);
  assert.equal(canTriggerDesperateCrit({ side: 'ally', alive: false, hp: 10, maxHp: 100 }), false);
  assert.equal(canTriggerDesperateCrit({ side: 'enemy', alive: true, hp: 10, maxHp: 100 }), false);
});

test('desperate dodge threshold is strictly below 10 percent and excludes dead units', () => {
  assert.equal(canTriggerDesperateDodge({ side: 'ally', alive: true, hp: 10, maxHp: 100 }), false);
  assert.equal(canTriggerDesperateDodge({ side: 'ally', alive: true, hp: 9, maxHp: 100 }), true);
  assert.equal(canTriggerDesperateDodge({ side: 'ally', alive: false, hp: 1, maxHp: 100 }), false);
  assert.equal(canTriggerDesperateDodge({ side: 'enemy', alive: true, hp: 1, maxHp: 100 }), false);
});

test('critical and dodge rolls use each character rate and the supplied random source', () => {
  const unit = { side: 'ally', alive: true, hp: 5, maxHp: 100, desperateCritRate: .2, desperateDodgeRate: .3 };
  assert.equal(rollDesperateCrit(unit, () => .19), true);
  assert.equal(rollDesperateCrit(unit, () => .2), false);
  assert.equal(rollDesperateDodge(unit, () => .29), true);
  assert.equal(rollDesperateDodge(unit, () => .3), false);
});

test('a multi-hit active skill makes one desperate-crit roll and triples every hit', () => {
  const originalRandom = Math.random;
  Math.random = () => .5;
  let desperateCritRolls = 0;
  try {
    const result = simulateBattle(
      [{
        uid: 'a_test',
        name: 'Test Hero',
        hp: 19,
        maxHp: 100,
        atk: 100,
        def: 0,
        spd: 100,
        crit: 0,
        desperateCritRate: .3,
        desperateDodgeRate: .1,
        skills: ['shadow'],
      }],
      [{
        uid: 'e_test',
        name: 'Test Enemy',
        hp: 10000,
        maxHp: 10000,
        atk: 0,
        def: 0,
        spd: 1,
        crit: 0,
        skills: ['claw'],
      }],
      1,
      { random: () => { desperateCritRolls += 1; return 0; } },
    );
    const hits = result.events.filter((event) => event.kind === 'damage' && event.sid === 'a_test');
    assert.equal(desperateCritRolls, 1);
    assert.equal(hits.length, 2);
    assert.ok(hits.every((event) => event.desperateCrit));
    assert.deepEqual(hits.map((event) => event.amount), [330, 330]);
  } finally {
    Math.random = originalRandom;
  }
});

test('each enemy direct hit checks desperate dodge before applying damage', () => {
  const result = simulateBattle(
    [{
      uid: 'a_test',
      name: 'Test Hero',
      hp: 9,
      maxHp: 100,
      atk: 10,
      def: 0,
      spd: 1,
      crit: 0,
      desperateCritRate: .1,
      desperateDodgeRate: .3,
      skills: ['slash'],
    }],
    [{
      uid: 'e_test',
      name: 'Test Enemy',
      hp: 10000,
      maxHp: 10000,
      atk: 100,
      def: 0,
      spd: 100,
      crit: 0,
      skills: ['claw'],
    }],
    1,
    { random: () => 0 },
  );
  assert.ok(result.events.some((event) => event.kind === 'dodge' && event.sid === 'e_test' && event.tid === 'a_test'));
  assert.equal(result.events.some((event) => event.kind === 'damage' && event.sid === 'e_test' && event.tid === 'a_test'), false);
});
