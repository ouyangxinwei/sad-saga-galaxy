import test from 'node:test';
import assert from 'node:assert/strict';
import { getEquipmentBonuses, normalizeStatusResistance } from '../src/lib/equipment.js';
import { getStatusApplicationRule, makeUnit } from '../src/lib/battle.js';
import { getStage, BOSS_STATUS_IMMUNITIES } from '../src/lib/gameData.js';

test('status resistance normalizes each ailment and caps at 60%', () => {
  assert.deepEqual(normalizeStatusResistance({ poison: 0.9, blind: -0.1 }), { poison: 0.6, blind: 0, paralysis: 0, sleep: 0, confusion: 0 });
});
test('equipped armor and relic resistance stacks additively', () => {
  const state = { equipped: { hero: { weapon: null, armor: 'a_iron', relic: 'r_aegis' } }, equipmentInventory: { weapon: {}, armor: { a_iron: 1 } }, relics: { r_aegis: 1 } };
  const bonuses = getEquipmentBonuses(state, 'hero');
  for (const type of ['poison','blind','paralysis','sleep','confusion']) assert.equal(bonuses.statusResistance[type], 0.2);
});
test('resistance lowers only status application chance', () => {
  const unit = makeUnit({ uid: 'ally', hp: 100, maxHp: 100, statusResistance: { poison: 0.25 } });
  assert.deepEqual(getStatusApplicationRule(unit, 'poison', 0.2), { immune: false, resistance: 0.25, chance: 0.15 });
});
test('boss immunity takes precedence over equipment resistance', () => {
  const boss = makeUnit({ uid: 'boss', hp: 100, maxHp: 100, isBoss: true, statusImmunities: ['sleep'], statusResistance: { sleep: 0.6 } });
  assert.deepEqual(getStatusApplicationRule(boss, 'sleep', 0.2), { immune: true, resistance: 1, chance: 0 });
  assert.deepEqual(getStatusApplicationRule(boss, 'poison', 0.2), { immune: false, resistance: 0, chance: 0.2 });
});
test('only the lead enemy on every fifth stage receives type-specific immunity', () => {
  const stage = getStage('normal', 5);
  assert.equal(stage.boss, true);
  assert.equal(stage.enemies[0].isBoss, true);
  assert.ok(stage.enemies[0].statusImmunities.length > 0);
  assert.ok(stage.enemies[0].statusImmunities.every(type => Object.values(BOSS_STATUS_IMMUNITIES).flat().includes(type)));
  assert.equal(stage.enemies.slice(1).every(enemy => !enemy.isBoss && enemy.statusImmunities.length === 0), true);
});
