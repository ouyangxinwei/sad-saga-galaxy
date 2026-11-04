import test from 'node:test';
import assert from 'node:assert/strict';
import { exportSaveData, inspectSaveData, restoreSaveData, SAVE_EXPORT_FORMAT, SAVE_KEY } from '../src/lib/save.js';

function sample(version = 20) {
  return {
    version, level: 18, exp: 123, rebirth: 1, gold: 45678, gems: 321, tickets: 7,
    stamina: 42, medals: 12, cards: { lise: true, kain: true },
    cardCounts: { lise: 2, kain: 1 }, party: ['lise', 'kain'],
    progress: { normal: 35, hard: 4, nightmare: 2 },
    characterProgression: { schemaVersion: 1, instances: {
      'lise-copy-1': { instanceId: 'lise-copy-1', cardId: 'lise', instanceNumber: 1, level: 22, exp: 31, breakthroughCount: 1, levelCap: 70, breakthroughBonuses: { hp: 20, atk: 6, def: 2, mp: 3 } },
      'lise-copy-2': { instanceId: 'lise-copy-2', cardId: 'lise', instanceNumber: 2, level: 1, exp: 0, breakthroughCount: 0, levelCap: 60, breakthroughBonuses: { hp: 0, atk: 0, def: 0, mp: 0 } },
      'kain-copy-1': { instanceId: 'kain-copy-1', cardId: 'kain', instanceNumber: 1, level: 1, exp: 0, breakthroughCount: 0, levelCap: 60, breakthroughBonuses: { hp: 0, atk: 0, def: 0, mp: 0 } },
    } },
  };
}
function mockStorage({ fail = false } = {}) {
  const data = new Map([[SAVE_KEY, 'CURRENT_SAVE_MUST_SURVIVE']]);
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { if (fail) throw new Error('quota'); data.set(key, String(value)); },
    removeItem: (key) => data.delete(key),
    _data: data,
  };
  return data;
}

test('export creates a complete versioned JSON envelope and preview summary', () => {
  const payload = exportSaveData(sample(), 'v0.51');
  assert.equal(payload.format, SAVE_EXPORT_FORMAT);
  assert.equal(payload.appVersion, 'v0.51');
  assert.ok(payload.exportedAt);
  const preview = inspectSaveData(JSON.stringify(payload));
  assert.equal(preview.metadata.characterCount, 5);
  assert.equal(preview.metadata.characterCopies, 6);
  assert.equal(preview.metadata.gold, 45678);
  assert.equal(preview.metadata.normal, 35);
  assert.equal(preview.state.characterProgression.instances['lise-copy-1'].level, 22);
});

test('legacy raw v20 save imports and keeps player, resources, party, progress and growth', () => {
  const preview = inspectSaveData(JSON.stringify(sample(20)));
  assert.equal(preview.metadata.appVersion, 'Legacy JSON');
  assert.equal(preview.state.level, 18);
  assert.equal(preview.state.gold, 45678);
  assert.deepEqual(preview.state.party, ['lise', 'kain']);
  assert.equal(preview.state.progress.normal, 35);
  assert.equal(preview.state.characterProgression.instances['lise-copy-1'].level, 22);
});

test('invalid JSON and malformed save never overwrite current local save', () => {
  const data = mockStorage();
  assert.equal(restoreSaveData('{broken').success, false);
  assert.equal(restoreSaveData(JSON.stringify({ version: 20, cards: {}, progress: {} })).success, false);
  assert.equal(data.get(SAVE_KEY), 'CURRENT_SAVE_MUST_SURVIVE');
});

test('unsupported future save version never overwrites current local save', () => {
  const data = mockStorage();
  assert.equal(restoreSaveData(JSON.stringify(sample(21))).reason, 'unsupported-version');
  assert.equal(data.get(SAVE_KEY), 'CURRENT_SAVE_MUST_SURVIVE');
});

test('successful restore writes normalized state only after validation', () => {
  const data = mockStorage();
  const result = restoreSaveData(JSON.stringify(exportSaveData(sample(), 'v0.51')));
  assert.equal(result.success, true);
  const saved = JSON.parse(data.get(SAVE_KEY));
  assert.equal(saved.gold, 45678);
  assert.equal(saved.characterProgression.instances['lise-copy-1'].level, 22);
});

test('local storage write failure leaves original save intact', () => {
  const data = mockStorage({ fail: true });
  const result = restoreSaveData(JSON.stringify(exportSaveData(sample(), 'v0.51')));
  assert.equal(result.success, false);
  assert.equal(result.reason, 'storage-write-failed');
  assert.equal(data.get(SAVE_KEY), 'CURRENT_SAVE_MUST_SURVIVE');
});
