import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_GROWTH_RULES,
  CHARACTER_PROGRESSION_SCHEMA_VERSION,
  createCharacterProgressionRecord,
  normalizeCharacterProgressionState,
  characterExpNeed,
  addCharacterExperience,
  grantPartyCharacterExperience,
  characterBreakthroughCost,
  breakthroughCharacter,
  fuseCharacterProgressionInstances,
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


test('character EXP raises levels using the shared game EXP curve', () => {
  const record = createCharacterProgressionRecord('lise', 'lise-main');
  const result = addCharacterExperience(record, characterExpNeed(1) + 12);
  assert.equal(result.record.level, 2);
  assert.equal(result.record.exp, 12);
  assert.equal(result.levelsGained, 1);
  assert.equal(result.expGained, characterExpNeed(1) + 12);
});

test('character EXP remains stored after reaching the current level cap', () => {
  const record = {
    ...createCharacterProgressionRecord('lise', 'lise-main'),
    level: 60,
    levelCap: 60,
    exp: 25,
  };
  const result = addCharacterExperience(record, 500);
  assert.equal(result.record.level, 60);
  assert.equal(result.record.exp, 525);
  assert.equal(result.levelsGained, 0);
});

test('deployed characters receive EXP while reserve characters do not', () => {
  const state = {
    party: ['lise', 'kain', null, 'lise'],
    characterProgression: {
      schemaVersion: 1,
      instances: {
        'lise-a': { ...createCharacterProgressionRecord('lise', 'lise-a', 1), level: 4, exp: 20 },
        'lise-b': { ...createCharacterProgressionRecord('lise', 'lise-b', 2), level: 8, exp: 10 },
        'kain-a': createCharacterProgressionRecord('kain', 'kain-a', 1),
        'reserve-a': createCharacterProgressionRecord('reserve', 'reserve-a', 1),
      },
    },
  };
  const result = grantPartyCharacterExperience(state, 50);
  assert.equal(result.recipients.length, 2);
  assert.equal(result.state.characterProgression.instances['lise-b'].exp, 60);
  assert.equal(result.state.characterProgression.instances['lise-a'].exp, 20);
  assert.equal(result.state.characterProgression.instances['kain-a'].exp, 50);
  assert.equal(result.state.characterProgression.instances['reserve-a'].exp, 0);
});

test('invalid or non-positive character EXP does not mutate progression', () => {
  const record = createCharacterProgressionRecord('lise', 'lise-main');
  assert.equal(addCharacterExperience(record, 0).record, record);
  const state = {
    party: ['lise'],
    characterProgression: { instances: { 'lise-main': record } },
  };
  const result = grantPartyCharacterExperience(state, -10);
  assert.equal(result.state, state);
  assert.equal(result.recipients.length, 0);
});


test('breakthrough material cost increases with every breakthrough', () => {
  assert.deepEqual(characterBreakthroughCost(0), { shards: 3, gold: 1000 });
  assert.deepEqual(characterBreakthroughCost(1), { shards: 5, gold: 2000 });
  assert.deepEqual(characterBreakthroughCost(5), { shards: 13, gold: 6000 });
});

test('breakthrough preserves level, raises cap, consumes materials, and applies stored EXP', () => {
  const record = { ...createCharacterProgressionRecord('lise', 'lise-main'), level: 60, levelCap: 60, exp: characterExpNeed(60) + 25 };
  const state = { gold: 5000, cardShards: { lise: 8 }, characterProgression: { schemaVersion: 1, instances: { 'lise-main': record } } };
  const result = breakthroughCharacter(state, 'lise');
  assert.equal(result.success, true);
  assert.equal(result.record.breakthroughCount, 1);
  assert.equal(result.record.levelCap, 70);
  assert.equal(result.record.level, 61);
  assert.equal(result.state.gold, 4000);
  assert.equal(result.state.cardShards.lise, 5);
  assert.equal(result.record.exp, 25);
});

test('breakthrough requires max level and sufficient character shards and gold', () => {
  const belowCap = {
    gold: 999, cardShards: { lise: 2 },
    characterProgression: { instances: { 'lise-main': { ...createCharacterProgressionRecord('lise', 'lise-main'), level: 59 } } },
  };
  assert.equal(breakthroughCharacter(belowCap, 'lise').reason, 'level-cap-not-reached');
  const insufficient = {
    ...belowCap, gold: 5000,
    characterProgression: { instances: { 'lise-main': { ...belowCap.characterProgression.instances['lise-main'], level: 60 } } },
  };
  assert.equal(breakthroughCharacter(insufficient, 'lise').reason, 'insufficient-materials');
  assert.equal(insufficient.gold, 5000);
  assert.equal(insufficient.cardShards.lise, 2);
});

test('breakthrough has no fixed count limit', () => {
  let state = {
    gold: 100000, cardShards: { lise: 100 },
    characterProgression: { instances: { 'lise-main': { ...createCharacterProgressionRecord('lise', 'lise-main'), level: 60 } } },
  };
  for (let i = 0; i < 4; i += 1) {
    const result = breakthroughCharacter(state, 'lise');
    assert.equal(result.success, true);
    state = result.state;
    const record = state.characterProgression.instances['lise-main'];
    record.level = record.levelCap;
  }
  assert.equal(state.characterProgression.instances['lise-main'].breakthroughCount, 4);
  assert.equal(state.characterProgression.instances['lise-main'].levelCap, 100);
});


test('fusion transfers the strongest consumed source growth to the new result copy', () => {
  const sourceRecords = {
    'src-1': { ...createCharacterProgressionRecord('lise', 'src-1', 1), level: 12, exp: 10 },
    'src-2': { ...createCharacterProgressionRecord('lise', 'src-2', 2), level: 30, exp: 50, breakthroughCount: 2, levelCap: 80 },
    'src-3': { ...createCharacterProgressionRecord('lise', 'src-3', 3), level: 8, exp: 5 },
  };
  const existingResult = { ...createCharacterProgressionRecord('lise_S', 'result-1'), level: 20, exp: 200 };
  const state = {
    cards: { lise: true, lise_S: true },
    cardCounts: { lise: 3, lise_S: 1 },
    characterProgression: { schemaVersion: 1, instances: { ...sourceRecords, 'result-1': existingResult } },
  };
  const fused = fuseCharacterProgressionInstances(state, 'lise', 'lise_S', 3);
  const rebound = Object.values(fused.characterProgression.instances).find((record) => record.cardId === 'lise_S' && record.instanceId !== 'result-1');
  assert.equal(rebound.level, 30);
  assert.equal(rebound.exp, 50);
  assert.equal(rebound.breakthroughCount, 2);
  assert.equal(rebound.levelCap, 80);
  assert.equal(fused.characterProgression.instances['result-1'].level, 20);
  assert.equal(Object.values(fused.characterProgression.instances).some((record) => record.cardId === 'lise'), false);
  assert.equal(state.characterProgression.instances['src-2'].level, 30);
});

test('fusion preserves an existing result copy when it is the strongest growth record', () => {
  const instances = {
    'src-1': { ...createCharacterProgressionRecord('lise', 'src-1'), level: 12, exp: 10 },
    'src-2': { ...createCharacterProgressionRecord('lise', 'src-2'), level: 30, exp: 50 },
    'src-3': { ...createCharacterProgressionRecord('lise', 'src-3'), level: 8, exp: 5 },
    'result-1': { ...createCharacterProgressionRecord('lise_S', 'result-1'), level: 45, exp: 22, breakthroughCount: 3, levelCap: 90 },
  };
  const state = {
    cards: { lise: true, lise_S: true },
    cardCounts: { lise: 3, lise_S: 1 },
    characterProgression: { schemaVersion: 1, instances },
  };
  const fused = fuseCharacterProgressionInstances(state, 'lise', 'lise_S', 3);
  assert.deepEqual(fused.characterProgression.instances['result-1'], instances['result-1']);
  assert.equal(Object.values(fused.characterProgression.instances).filter((record) => record.cardId === 'lise_S').length, 1);
  assert.equal(Object.values(fused.characterProgression.instances).some((record) => record.cardId === 'lise'), false);
});

test('fusion compares breakthrough progress and preserves the strongest remaining source copies', () => {
  const instances = {
    weak: { ...createCharacterProgressionRecord('lise', 'weak'), level: 5 },
    middle: { ...createCharacterProgressionRecord('lise', 'middle'), level: 10 },
    strong: { ...createCharacterProgressionRecord('lise', 'strong'), level: 50, exp: 300 },
    strongest: { ...createCharacterProgressionRecord('lise', 'strongest'), level: 60, breakthroughCount: 3, levelCap: 90 },
  };
  const state = { characterProgression: { instances } };
  const fused = fuseCharacterProgressionInstances(state, 'lise', 'lise_S', 3);
  assert.equal(fused.characterProgression.instances.strongest.cardId, 'lise');
  assert.equal(fused.characterProgression.instances.strongest.level, 60);
  assert.equal(fused.characterProgression.instances.strong.cardId, 'lise');
  assert.equal(Object.values(fused.characterProgression.instances).filter((record) => record.cardId === 'lise_S').length, 0);
});

test('breakthrough applies all stored EXP after raising the cap without discarding remainder', () => {
  const record = {
    ...createCharacterProgressionRecord('lise', 'lise-main'),
    level: 60,
    levelCap: 60,
    exp: characterExpNeed(60) + characterExpNeed(61) + 37,
  };
  const state = {
    gold: 5000,
    cardShards: { lise: 8 },
    characterProgression: { schemaVersion: 1, instances: { 'lise-main': record } },
  };
  const result = breakthroughCharacter(state, 'lise');
  assert.equal(result.success, true);
  assert.equal(result.record.level, 62);
  assert.equal(result.record.levelCap, 70);
  assert.equal(result.record.exp, 37);
  assert.equal(result.record.breakthroughCount, 1);
});

