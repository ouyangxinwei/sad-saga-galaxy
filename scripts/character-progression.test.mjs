import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_GROWTH_RULES,
  CHARACTER_PROGRESSION_SCHEMA_VERSION,
  createCharacterProgressionRecord,
  normalizeCharacterProgressionState,
} from '../src/lib/characterProgression.js';

test('confirmed character growth policies are represented exactly in Phase 1', () => {
  assert.deepEqual(CHARACTER_GROWTH_RULES, {
    breakthroughLevel: 'keep',
    breakthroughLimit: 'unlimited',
    breakthroughRequirement: 'materials',
    maxLevelExp: 'store',
    duplicateFusionGrowth: 'strongest',
  });
});

test('legacy owned cards migrate to independent level-one progression records', () => {
  const state = normalizeCharacterProgressionState({
    cards: { lise: true, kain: true },
    cardCounts: { lise: 1, kain: 1 },
    level: 27,
    exp: 123,
  });
  const records = Object.values(state.characterProgression.instances);
  assert.equal(state.characterProgression.schemaVersion, CHARACTER_PROGRESSION_SCHEMA_VERSION);
  assert.equal(records.length, 2);
  assert.ok(records.every((record) => record.level === 1 && record.exp === 0));
  assert.equal(state.level, 27);
  assert.equal(state.exp, 123);
});

test('each counted copy receives a distinct progression instance', () => {
  const state = normalizeCharacterProgressionState({
    cards: { lise: true },
    cardCounts: { lise: 3 },
  });
  const records = Object.values(state.characterProgression.instances);
  assert.equal(records.length, 3);
  assert.equal(new Set(records.map((record) => record.instanceId)).size, 3);
  assert.ok(records.every((record) => record.cardId === 'lise'));
});

test('normalization is idempotent and preserves existing progression values', () => {
  const first = normalizeCharacterProgressionState({
    cards: { lise: true },
    cardCounts: { lise: 2 },
  });
  const firstId = Object.keys(first.characterProgression.instances)[0];
  first.characterProgression.instances[firstId] = {
    ...first.characterProgression.instances[firstId],
    level: 24,
    exp: 321,
    breakthroughCount: 2,
    levelCap: 80,
  };
  const second = normalizeCharacterProgressionState(first);
  assert.deepEqual(second.characterProgression, first.characterProgression);
  assert.equal(second.characterProgression.instances[firstId].level, 24);
  assert.equal(second.characterProgression.instances[firstId].exp, 321);
  assert.equal(second.characterProgression.instances[firstId].breakthroughCount, 2);
  assert.equal(second.characterProgression.instances[firstId].levelCap, 80);
});

test('multiple instances of the same card keep independent progression', () => {
  const state = {
    cards: { lise: true },
    cardCounts: { lise: 2 },
    characterProgression: {
      schemaVersion: 1,
      instances: {
        'lise-copy-a': createCharacterProgressionRecord('lise', 'lise-copy-a', 1),
        'lise-copy-b': { ...createCharacterProgressionRecord('lise', 'lise-copy-b', 2), level: 15, exp: 70 },
      },
    },
  };
  const normalized = normalizeCharacterProgressionState(state);
  assert.equal(normalized.characterProgression.instances['lise-copy-a'].level, 1);
  assert.equal(normalized.characterProgression.instances['lise-copy-b'].level, 15);
  assert.equal(normalized.characterProgression.instances['lise-copy-b'].exp, 70);
});

test('unowned card progression is not fabricated and existing orphan records are retained', () => {
  const state = normalizeCharacterProgressionState({
    cards: { lise: true, kain: false },
    cardCounts: { lise: 1, kain: 1 },
    characterProgression: {
      instances: {
        'old-kain-copy': createCharacterProgressionRecord('kain', 'old-kain-copy'),
      },
    },
  });
  assert.equal(Object.values(state.characterProgression.instances).filter((x) => x.cardId === 'lise').length, 1);
  assert.equal(Boolean(state.characterProgression.instances['old-kain-copy']), true);
});
