import test from 'node:test';
import assert from 'node:assert/strict';
import { HEROES, heroStats } from '../src/lib/gameData.js';
import { cardStats, partyUnits } from '../src/lib/cards.js';
import { getEquipmentBonuses } from '../src/lib/equipment.js';
import { applyEquipmentDamageModifiers, criticalDamageMultiplier, effectiveMpCost, healingMultiplier } from '../src/lib/battle.js';

const equippedState = {
  level: 1,
  rebirth: 0,
  lang: 'en',
  party: ['lise'],
  relics: { r_orb: 1 },
  equipmentInventory: {
    weapon: { w_starblade: 1 },
    armor: { a_iron: 1 },
  },
  equipped: {
    lise: { weapon: 'w_starblade', armor: 'a_iron', relic: 'r_orb' },
  },
};

test('adds base attributes and hybrid modifiers across all three slots', () => {
  const bonus = getEquipmentBonuses(equippedState, 'lise');
  assert.equal(bonus.atkPct, 0.32);
  assert.equal(bonus.hpPct, 0.25);
  assert.equal(bonus.defPct, 0.12);
  assert.equal(bonus.crit, 0.03);
  assert.equal(bonus.damageDealtPct, 0.10);
  assert.equal(bonus.damageReductionPct, 0.05);
});

test('keeps existing relic stat bonuses and calculates expanded character stats', () => {
  const hero = HEROES.find((item) => item.id === 'lise');
  const stats = cardStats({
    level: 1,
    rebirth: 0,
    relics: { r_sword: 1 },
    equipped: { lise: { weapon: null, armor: null, relic: 'r_sword' } },
  }, 'lise');
  const base = heroStats(hero);
  assert.equal(stats.hp, base.hp);
  assert.equal(stats.atk, Math.round(base.atk * 1.12));
  assert.equal(stats.critDamagePct, 0.10);
});

test('passes hybrid modifiers into ally battle units', () => {
  const unit = partyUnits(equippedState)[0];
  assert.equal(unit.damageDealtPct, 0.10);
  assert.equal(unit.damageReductionPct, 0.05);
  assert.equal(unit.crit, Math.min(0.75, heroStats(HEROES.find((item) => item.id === 'lise')).crit + 0.03));
});

test('applies bounded damage, critical, healing, and MP-cost modifiers', () => {
  assert.equal(applyEquipmentDamageModifiers(100, { damageDealtPct: 0.2 }, { damageReductionPct: 0.1 }), 108);
  assert.equal(criticalDamageMultiplier({ critDamagePct: 0.15 }), 1.8);
  assert.equal(healingMultiplier({ healBonus: 0.2 }), 1.2);
  assert.equal(effectiveMpCost({ mp: 30 }, { mpCostReductionPct: 0.2 }), 24);
  assert.equal(effectiveMpCost({ mp: 30 }, { mpCostReductionPct: 0.9 }), 15);
  assert.equal(effectiveMpCost({ mp: 30 }, {}), 30);
});

test('clamps accumulated modifiers to safe limits', () => {
  const state = {
    ...equippedState,
    equipmentInventory: {
      weapon: { w_starblade: 1 },
      armor: { a_iron: 1 },
    },
    relics: { r_crown: 1 },
    equipped: { lise: { weapon: 'w_starblade', armor: 'a_iron', relic: 'r_crown' } },
  };
  const bonus = getEquipmentBonuses(state, 'lise');
  assert.ok(bonus.damageDealtPct <= 1);
  assert.ok(bonus.damageReductionPct <= 0.75);
  assert.ok(bonus.crit <= 0.75);
  assert.ok(bonus.mpCostReductionPct <= 0.5);
});
