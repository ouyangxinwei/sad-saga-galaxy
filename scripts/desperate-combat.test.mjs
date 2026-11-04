import test from 'node:test';
import assert from 'node:assert/strict';
import { HEROES, heroStats } from '../src/lib/gameData.js';
import { applyEquipmentDamageModifiers, applyFormationSkillModifiers, effectiveMpCost, makeUnit, orderBattleUnits, simulateBattle } from '../src/lib/battle.js';
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
  assert.equal(DESPERATE_COMBAT_RULES.formationCritMaxRate, .35);
  assert.equal(DESPERATE_COMBAT_RULES.formationDodgeMaxRate, .45);
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
  assert.equal(rollDesperateCrit({ ...unit, desperateCritRate: .35 }, () => .34), true);
  assert.equal(rollDesperateDodge({ ...unit, desperateDodgeRate: .45 }, () => .44), true);
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
  assert.ok(result.events.some((event) => event.kind === 'dodge' && event.sid === 'e_0' && event.tid === 'a_test'));
  assert.equal(result.events.some((event) => event.kind === 'damage' && event.sid === 'e_0' && event.tid === 'a_test'), false);
});


test('formation bonuses can raise desperate combat rates above the base-character cap', () => {
  const unit = makeUnit({
    uid: 'a_formation',
    hp: 9,
    maxHp: 100,
    desperateCritRate: 0.35,
    desperateDodgeRate: 0.45,
  });
  assert.equal(unit.desperateCritRate, 0.35);
  assert.equal(unit.desperateDodgeRate, 0.45);
});

test('Long Serpent grants follow-up critical chance only to a consecutive ally action', () => {
  const originalRandom = Math.random;
  Math.random = () => 0.03;
  try {
    const result = simulateBattle(
      [
        { uid: 'a_first', name: 'First', hp: 100, maxHp: 100, atk: 10, def: 0, spd: 120, crit: 0, skills: ['slash'], formationBonus: { followUpCriticalPp: 0.05 } },
        { uid: 'a_second', name: 'Second', hp: 100, maxHp: 100, atk: 10, def: 0, spd: 110, crit: 0, skills: ['slash'], formationBonus: { followUpCriticalPp: 0.05 } },
      ],
      [{ uid: 'e_target', name: 'Target', hp: 10000, maxHp: 10000, atk: 0, def: 0, spd: 1, crit: 0, skills: ['claw'] }],
      1,
      { random: () => 0.99 },
    );
    const firstHit = result.events.find((event) => event.kind === 'damage' && event.sid === 'a_first');
    const secondHit = result.events.find((event) => event.kind === 'damage' && event.sid === 'a_second');
    assert.equal(firstHit.crit, false);
    assert.equal(secondHit.crit, true);
  } finally {
    Math.random = originalRandom;
  }
});


test('formation damage reduction applies to incoming damage modifiers', () => {
  const defender = makeUnit({ uid: 'a_guard', hp: 100, maxHp: 100, damageReductionPct: 0.05 });
  assert.equal(applyEquipmentDamageModifiers(100, { damageDealtPct: 0 }, defender), 95);
});

test('formation skill damage and skill-effect bonuses scale the correct skill outputs', () => {
  const skill = { kind: 'attack', power: 2, heal: 3, shield: 0.2, mitigate: 0.3, mp: 20, turns: 2 };
  const enhanced = applyFormationSkillModifiers(skill, { skillDamagePct: 0.10, skillEffectPct: 0.05 });
  assert.ok(Math.abs(enhanced.power - 2.31) < 1e-10);
  assert.ok(Math.abs(enhanced.heal - 3.15) < 1e-10);
  assert.ok(Math.abs(enhanced.shield - 0.21) < 1e-10);
  assert.ok(Math.abs(enhanced.mitigate - 0.315) < 1e-10);
  assert.equal(enhanced.mp, 20);
});

test('formation MP-cost reduction applies after skill selection and respects the shared cap', () => {
  assert.equal(effectiveMpCost({ mp: 20 }, { mpCostReductionPct: 0.10 }), 18);
  assert.equal(effectiveMpCost({ mp: 20 }, { mpCostReductionPct: 0.80 }), 10);
});


test('Long Serpent orders allied action slots by configured formation position', () => {
  const ordered = orderBattleUnits([
    { uid: 'a_pos0', side: 'ally', spd: 50, formationActionOrder: 'formation-order', formationPositionIndex: 0 },
    { uid: 'a_pos1', side: 'ally', spd: 100, formationActionOrder: 'formation-order', formationPositionIndex: 1 },
    { uid: 'a_pos2', side: 'ally', spd: 75, formationActionOrder: 'formation-order', formationPositionIndex: 2 },
    { uid: 'e_fast', side: 'enemy', spd: 90 },
    { uid: 'e_slow', side: 'enemy', spd: 60 },
  ]);
  assert.deepEqual(ordered.filter(unit => unit.side === 'ally').map(unit => unit.uid), ['a_pos0', 'a_pos1', 'a_pos2']);
  assert.deepEqual(ordered.map(unit => unit.uid), ['a_pos0', 'e_fast', 'a_pos1', 'e_slow', 'a_pos2']);
});


test('battle events expose the actual round order and formation-specific skill markers', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const result = simulateBattle(
      [
        { uid: 'a_second', name: 'Second', hp: 100, maxHp: 100, atk: 100, def: 0, spd: 90, crit: 0, skills: ['slash'], formationActionOrder: 'formation-order', formationPositionIndex: 1, skillDamagePct: 0.10, skillEffectPct: 0.05, formationEffects: { formationName: { zh: '长蛇阵' }, mpCostReductionPct: 0 }, formationBonus: { criticalPp: 0.04 } },
        { uid: 'a_first', name: 'First', hp: 100, maxHp: 100, atk: 100, def: 0, spd: 120, crit: 0, skills: ['slash'], formationActionOrder: 'formation-order', formationPositionIndex: 0 },
      ],
      [{ uid: 'e_target', name: 'Target', hp: 10000, maxHp: 10000, atk: 0, def: 0, spd: 1, crit: 0, skills: ['claw'] }],
      1,
      { random: () => 0.99 },
    );
    const round = result.events.find((event) => event.kind === 'round');
    assert.deepEqual(round.order.map((unit) => unit.uid), ['a_first', 'a_second', 'e_0']);
    const action = result.events.find((event) => event.kind === 'action' && event.uid === 'a_second');
    assert.equal(action.formationSkillDamagePct, 0.10);
    assert.equal(action.formationSkillEffectPct, 0.05);
    const hit = result.events.find((event) => event.kind === 'damage' && event.sid === 'a_second');
    assert.equal(hit.formationEnhanced, true);
    assert.equal(hit.formationChancePp, 0.04);
  } finally {
    Math.random = originalRandom;
  }
});
test('Four-Corner Core schedules its center carry after all other allies', () => {
  const ordered = orderBattleUnits([
    { uid: 'a_corner1', side: 'ally', spd: 50, formationPositionIndex: 0 },
    { uid: 'a_core', side: 'ally', spd: 120, formationActionOrder: 'ally-last', formationPositionIndex: 2 },
    { uid: 'a_corner2', side: 'ally', spd: 80, formationPositionIndex: 3 },
    { uid: 'e_fast', side: 'enemy', spd: 100 },
  ]);
  assert.deepEqual(ordered.filter(unit => unit.side === 'ally').map(unit => unit.uid), ['a_corner2', 'a_corner1', 'a_core']);
  assert.equal(ordered.filter(unit => unit.side === 'ally').at(-1).uid, 'a_core');
});
