import test from 'node:test';
import assert from 'node:assert/strict';
import { getCharacterCombatChanceDisplay } from '../src/lib/characterCombatDisplay.js';

const definition = { stats: { crit: 0.08 } };
const desperateRates = { desperateCritRate: 0.2, desperateDodgeRate: 0.18 };

test('combines character, equipment, fortune, and formation critical chance', () => {
  const result = getCharacterCombatChanceDisplay({
    definition,
    stats: { crit: 0.2 },
    equipmentCrit: 0.12,
    fortuneCrit: 0.03,
    desperateRates,
    formationBonus: { criticalPp: 0.05 },
  });
  assert.equal(result.critical.base, 0.08);
  assert.equal(result.critical.equipment, 0.12);
  assert.equal(result.critical.rate, 0.28);
});

test('uses the actual battle-unit chances when available', () => {
  const result = getCharacterCombatChanceDisplay({
    definition,
    stats: { crit: 0.2 },
    equipmentCrit: 0.12,
    fortuneCrit: 0.03,
    desperateRates,
    formationBonus: { criticalPp: 0.05, desperateCritPp: 0.05, dodgePp: 0.05, highSpeedDodgePp: 0.05 },
    battleUnit: { crit: 0.41, desperateCritRate: 0.31, desperateDodgeRate: 0.42, isHighSpeed: true },
  });
  assert.equal(result.critical.rate, 0.41);
  assert.equal(result.desperateCritical.rate, 0.31);
  assert.equal(result.desperateDodge.rate, 0.42);
  assert.equal(result.desperateDodge.highSpeedActive, true);
});

test('keeps conditional high-speed and follow-up bonuses separate', () => {
  const result = getCharacterCombatChanceDisplay({
    definition,
    stats: { crit: 0.08 },
    desperateRates,
    formationBonus: { conditionalHighSpeedDodgePp: 0.05, followUpCriticalPp: 0.05 },
    battleUnit: { isHighSpeed: false },
  });
  assert.equal(result.desperateDodge.highSpeedActive, false);
  assert.equal(result.desperateDodge.highSpeed, 0.05);
  assert.equal(result.followUpCriticalPp, 0.05);
  assert.equal(result.critical.rate, 0.08);
  assert.equal(result.desperateDodge.rate, 0.18);
});

test('respects combat probability caps', () => {
  const result = getCharacterCombatChanceDisplay({
    definition: { stats: { crit: 0.7 } },
    stats: { crit: 0.7 },
    equipmentCrit: 0.2,
    fortuneCrit: 0.2,
    desperateRates: { desperateCritRate: 0.3, desperateDodgeRate: 0.3 },
    formationBonus: { criticalPp: 0.2, desperateCritPp: 0.1, dodgePp: 0.1, highSpeedDodgePp: 0.1 },
  });
  assert.equal(result.critical.rate, 0.75);
  assert.equal(result.desperateCritical.rate, 0.35);
  assert.equal(result.desperateDodge.rate, 0.45);
});
