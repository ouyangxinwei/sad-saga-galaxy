import test from 'node:test';
import assert from 'node:assert/strict';
import { equipItem, normalizeEquipmentState } from '../src/lib/equipment.js';

test('migrates legacy relic mapping and resolves duplicate wearers', () => {
  const migrated = normalizeEquipmentState({
    relics: { r_sword: 1, r_aegis: 1 },
    equipped: { lise: 'r_sword', kain: 'r_sword', shera: 'r_aegis' },
  });
  assert.deepEqual(migrated.equipped.lise, { weapon: null, armor: null, relic: 'r_sword' });
  assert.deepEqual(migrated.equipped.kain, { weapon: null, armor: null, relic: null });
  assert.deepEqual(migrated.equipped.shera, { weapon: null, armor: null, relic: 'r_aegis' });
  assert.equal(migrated.relics.r_sword, 1);
  assert.equal(migrated.equipmentSchemaVersion, 1);
});

test('normalization is idempotent and fills all slots', () => {
  const first = normalizeEquipmentState({ relics: { r_sword: 1 }, equipped: { lise: 'r_sword' } });
  assert.deepEqual(normalizeEquipmentState(first), first);
  assert.deepEqual(first.equipped.lise, { weapon: null, armor: null, relic: 'r_sword' });
});

test('preserves valid nested assignments and clears duplicate IDs', () => {
  const migrated = normalizeEquipmentState({
    equipmentSchemaVersion: 1,
    relics: { r_sword: 1 },
    equipmentInventory: { weapon: { w_1: 1 }, armor: {} },
    equipped: {
      lise: { weapon: 'w_1', armor: null, relic: 'r_sword' },
      kain: { weapon: 'w_1', armor: null, relic: 'r_sword' },
    },
  });
  assert.equal(migrated.equipped.lise.weapon, 'w_1');
  assert.equal(migrated.equipped.kain.weapon, null);
  assert.equal(migrated.equipped.lise.relic, 'r_sword');
  assert.equal(migrated.equipped.kain.relic, null);
});

test('enforces Unique ownership and supports unequip', () => {
  const state = normalizeEquipmentState({
    equipmentSchemaVersion: 1,
    relics: { r_sword: 1 },
    equipped: { lise: { relic: 'r_sword' }, kain: {} },
  });
  const rejected = equipItem(state, 'kain', 'relic', 'r_sword');
  assert.equal(rejected.ok, false);
  assert.equal(rejected.reason, 'already_equipped');
  const removed = equipItem(state, 'lise', 'relic', null);
  assert.equal(removed.ok, true);
  assert.equal(removed.state.equipped.lise.relic, null);
  const assigned = equipItem(removed.state, 'kain', 'relic', 'r_sword');
  assert.equal(assigned.ok, true);
  assert.equal(assigned.state.equipped.kain.relic, 'r_sword');
});

test('rejects equipment not present in the matching inventory', () => {
  const state = normalizeEquipmentState({ equipmentSchemaVersion: 1, relics: {}, equipped: {} });
  const result = equipItem(state, 'lise', 'relic', 'r_sword');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not_owned');
});
