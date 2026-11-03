import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_GROWTH_RULES,
  CHARACTER_CAREER_GROWTH,
  CHARACTER_BREAKTHROUGH_REWARDS,
  characterBreakthroughReward,
  getCharacterBreakthroughBonuses,
  getCharacterCareerArchetype,
  characterGrowthMultipliers,
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
import { cardStats } from '../src/lib/cards.js';

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
  assert.deepEqual(result.record.breakthroughBonuses, { hp: 20, atk: 6, def: 2, mp: 3 });
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
  assert.equal(fused.characterProgression.instances.strong, undefined);
  const inherited = Object.values(fused.characterProgression.instances).find((record) => record.cardId === 'lise_S');
  assert.equal(inherited.level, 50);
  assert.equal(inherited.exp, 300);
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



test('legacy v20 save migration preserves player progression, resources, equipment and existing character growth', () => {
  const legacySave = {
    version: 20,
    level: 42,
    exp: 987,
    rebirth: 2,
    gold: 45678,
    gems: 321,
    tickets: 7,
    cards: { lise: true, kain: true, archer: true },
    cardCounts: { lise: 2, kain: 1, archer: 1 },
    equipped: { lise: 'relic-1' },
    equipmentInventory: { weapon: { blade: 2 }, armor: {} },
    party: ['lise', 'kain'],
    progress: { normal: 35, hard: 4, nightmare: 0 },
  };
  const migrated = normalizeCharacterProgressionState(legacySave);
  assert.equal(migrated.level, 42);
  assert.equal(migrated.exp, 987);
  assert.equal(migrated.gold, 45678);
  assert.equal(migrated.gems, 321);
  assert.equal(migrated.tickets, 7);
  assert.deepEqual(migrated.equipped, legacySave.equipped);
  assert.deepEqual(migrated.equipmentInventory, legacySave.equipmentInventory);
  assert.deepEqual(migrated.party, legacySave.party);
  assert.deepEqual(migrated.progress, legacySave.progress);
  assert.equal(Object.values(migrated.characterProgression.instances).length, 4);
  assert.equal(Object.values(migrated.characterProgression.instances).filter((record) => record.cardId === 'lise').length, 2);
  assert.ok(Object.values(migrated.characterProgression.instances).every((record) => record.level === 1 && record.exp === 0));
  assert.deepEqual(normalizeCharacterProgressionState(migrated).characterProgression, migrated.characterProgression);
});

test('deployed characters store battle EXP at their cap without changing player EXP', () => {
  const capped = { ...createCharacterProgressionRecord('lise', 'lise-main'), level: 60, levelCap: 60, exp: 120 };
  const state = {
    level: 22,
    exp: 777,
    party: ['lise', 'kain'],
    characterProgression: { schemaVersion: 1, instances: {
      'lise-main': capped,
      'kain-main': createCharacterProgressionRecord('kain', 'kain-main'),
    } },
  };
  const result = grantPartyCharacterExperience(state, 450);
  assert.equal(result.state.characterProgression.instances['lise-main'].level, 60);
  assert.equal(result.state.characterProgression.instances['lise-main'].exp, 570);
  assert.equal(result.state.characterProgression.instances['kain-main'].level, 4);
  assert.equal(result.state.characterProgression.instances['kain-main'].exp, 71);
  assert.equal(result.state.level, 22);
  assert.equal(result.state.exp, 777);
  assert.equal(result.recipients.length, 2);
});

test('character detail EXP progress calculation remains bounded at cap and above', () => {
  const capped = { ...createCharacterProgressionRecord('lise', 'lise-main'), level: 60, levelCap: 60, exp: 12000 };
  const result = addCharacterExperience(capped, 500);
  assert.equal(result.record.level, 60);
  assert.equal(result.record.exp, 12500);
  assert.equal(result.levelsGained, 0);
});


test('career archetypes map existing classes to distinct growth profiles', () => {
  assert.equal(getCharacterCareerArchetype('sword'), 'attack');
  assert.equal(getCharacterCareerArchetype('mage'), 'attack');
  assert.equal(getCharacterCareerArchetype('guardian'), 'defense');
  assert.equal(getCharacterCareerArchetype('priest'), 'support');
  assert.equal(getCharacterCareerArchetype('alchemist'), 'support');
  assert.equal(getCharacterCareerArchetype('stargazer'), 'support');
  assert.equal(getCharacterCareerArchetype('future-custom-class'), 'balanced');
  assert.deepEqual(Object.keys(CHARACTER_CAREER_GROWTH), ['attack', 'defense', 'support', 'balanced']);
});
test('career growth is zero at level one and uses the approved linear per-level coefficients', () => {
  assert.deepEqual(characterGrowthMultipliers('sword', 1), { hp: 1, atk: 1, def: 1, mp: 1 });
  assert.deepEqual(characterGrowthMultipliers('sword', 60), { hp: 1 + 59 * .003, atk: 1 + 59 * .0055, def: 1 + 59 * .0025, mp: 1 + 59 * .0035 });
  assert.deepEqual(characterGrowthMultipliers('guardian', 60), { hp: 1 + 59 * .0055, atk: 1 + 59 * .0025, def: 1 + 59 * .0055, mp: 1 + 59 * .0035 });
  assert.deepEqual(characterGrowthMultipliers('priest', 60), { hp: 1 + 59 * .0035, atk: 1 + 59 * .0025, def: 1 + 59 * .0035, mp: 1 + 59 * .0055 });
  assert.deepEqual(characterGrowthMultipliers('future-custom-class', 60), { hp: 1 + 59 * .004, atk: 1 + 59 * .004, def: 1 + 59 * .004, mp: 1 + 59 * .004 });
});
test('character level growth changes battle HP, ATK, DEF and MP while leaving SPD unchanged', () => {
  const state = { level: 1, rebirth: 0, characterProgression: { instances: { copy: { cardId: 'lise', level: 1, exp: 0, breakthroughCount: 0, levelCap: 60 } } } };
  const low = cardStats(state, 'lise');
  const high = cardStats({ ...state, characterProgression: { instances: { copy: { ...state.characterProgression.instances.copy, level: 60 } } } }, 'lise');
  assert.equal(high.hp, Math.round(low.hp * (1 + 59 * .003)));
  assert.equal(high.atk, Math.round(low.atk * (1 + 59 * .0055)));
  assert.equal(high.def, Math.round(low.def * (1 + 59 * .0025)));
  assert.equal(high.mp, Math.round(low.mp * (1 + 59 * .0035)));
  assert.equal(high.spd, low.spd);
});
test('duplicate copies use the strongest progression record for battle stat growth', () => {
  const state = { level: 1, rebirth: 0, characterProgression: { instances: {
    weak: { cardId: 'lise', level: 12, exp: 0, breakthroughCount: 0, levelCap: 60 },
    strong: { cardId: 'lise', level: 30, exp: 0, breakthroughCount: 0, levelCap: 60 },
  } } };
  const stats = cardStats(state, 'lise');
  const base = cardStats({ level: 1, rebirth: 0 }, 'lise');
  assert.equal(stats.atk, Math.round(base.atk * (1 + 29 * .0055)));
});
test('player-level scaling and equipment bonuses remain separate from career growth', () => {
  const state = { level: 10, rebirth: 0, characterProgression: { instances: {
    copy: { cardId: 'lise', level: 20, exp: 0, breakthroughCount: 0, levelCap: 60 },
  } } };
  const stats = cardStats(state, 'lise');
  const base = cardStats({ level: 10, rebirth: 0 }, 'lise');
  assert.equal(stats.hp, Math.round(base.hp * (1 + 19 * .003)));
  assert.equal(stats.spd, base.spd);
});


test('fixed breakthrough rewards are career-specific flat stat bonuses', () => {
  assert.deepEqual(CHARACTER_BREAKTHROUGH_REWARDS.attack, { hp: 20, atk: 6, def: 2, mp: 3 });
  assert.deepEqual(CHARACTER_BREAKTHROUGH_REWARDS.defense, { hp: 35, atk: 2, def: 6, mp: 3 });
  assert.deepEqual(CHARACTER_BREAKTHROUGH_REWARDS.support, { hp: 20, atk: 2, def: 3, mp: 8 });
  assert.deepEqual(CHARACTER_BREAKTHROUGH_REWARDS.balanced, { hp: 25, atk: 4, def: 4, mp: 4 });
  assert.deepEqual(characterBreakthroughReward('sword'), CHARACTER_BREAKTHROUGH_REWARDS.attack);
  assert.deepEqual(characterBreakthroughReward('guardian'), CHARACTER_BREAKTHROUGH_REWARDS.defense);
  assert.deepEqual(characterBreakthroughReward('priest'), CHARACTER_BREAKTHROUGH_REWARDS.support);
});
test('one successful breakthrough grants its fixed reward once and cannot duplicate it on a second immediate attempt', () => {
  const record = { ...createCharacterProgressionRecord('lise', 'lise-main'), level: 60, levelCap: 60 };
  const state = { gold: 5000, cardShards: { lise: 8 }, characterProgression: { instances: { 'lise-main': record } } };
  const first = breakthroughCharacter(state, 'lise');
  assert.equal(first.success, true);
  assert.deepEqual(first.record.breakthroughBonuses, { hp: 20, atk: 6, def: 2, mp: 3 });
  const second = breakthroughCharacter(first.state, 'lise');
  assert.equal(second.success, false);
  assert.deepEqual(first.state.characterProgression.instances['lise-main'].breakthroughBonuses, { hp: 20, atk: 6, def: 2, mp: 3 });
});
test('subsequent unlimited breakthroughs add one fixed reward per successful breakthrough', () => {
  let state = { gold: 100000, cardShards: { kain: 100 }, characterProgression: { instances: {
    'kain-main': { ...createCharacterProgressionRecord('kain', 'kain-main'), level: 60, levelCap: 60 },
  } } };
  for (let count = 1; count <= 3; count += 1) {
    const current = state.characterProgression.instances['kain-main'];
    state = { ...state, characterProgression: { instances: { 'kain-main': { ...current, level: current.levelCap } } } };
    const result = breakthroughCharacter(state, 'kain');
    assert.equal(result.success, true);
    assert.equal(result.record.breakthroughCount, count);
    assert.equal(result.record.levelCap, 60 + count * 10);
    assert.deepEqual(result.record.breakthroughBonuses, { hp: 35 * count, atk: 2 * count, def: 6 * count, mp: 3 * count });
    state = result.state;
  }
});
test('legacy records backfill cumulative breakthrough rewards without changing level, EXP or resources', () => {
  const legacy = {
    level: 25, exp: 456, gold: 9000, cardShards: { lise: 4 },
    cards: { lise: true }, cardCounts: { lise: 1 },
    characterProgression: { instances: {
      'lise-old': { ...createCharacterProgressionRecord('lise', 'lise-old'), level: 70, exp: 123, breakthroughCount: 1, levelCap: 70 },
    } },
  };
  const migrated = normalizeCharacterProgressionState(legacy);
  const record = migrated.characterProgression.instances['lise-old'];
  assert.deepEqual(record.breakthroughBonuses, { hp: 20, atk: 6, def: 2, mp: 3 });
  assert.equal(record.level, 70); assert.equal(record.exp, 123);
  assert.equal(migrated.gold, 9000); assert.deepEqual(migrated.cardShards, { lise: 4 });
});
test('fixed breakthrough bonuses affect battle stats as flat values, independent of player level scaling', () => {
  const base = { level: 1, rebirth: 0 };
  const state = { ...base, characterProgression: { instances: {
    'lise-main': { ...createCharacterProgressionRecord('lise', 'lise-main'), breakthroughCount: 2, levelCap: 80, breakthroughBonuses: { hp: 40, atk: 12, def: 4, mp: 6 } },
  } } };
  const stats = cardStats(state, 'lise'), original = cardStats(base, 'lise');
  assert.equal(stats.hp, original.hp + 40); assert.equal(stats.atk, original.atk + 12);
  assert.equal(stats.def, original.def + 4); assert.equal(stats.mp, original.mp + 6);
});
test('fusion inherits the complete breakthrough bonus data from the strongest progression record', () => {
  const instances = {
    weak1: { ...createCharacterProgressionRecord('lise', 'weak1'), level: 10, breakthroughCount: 1, levelCap: 70, breakthroughBonuses: { hp: 20, atk: 6, def: 2, mp: 3 } },
    strong: { ...createCharacterProgressionRecord('lise', 'strong'), level: 60, breakthroughCount: 2, levelCap: 80, breakthroughBonuses: { hp: 40, atk: 12, def: 4, mp: 6 } },
    weak2: { ...createCharacterProgressionRecord('lise', 'weak2'), level: 5 },
  };
  const fused = fuseCharacterProgressionInstances({ characterProgression: { instances } }, 'lise', 'lise_S', 3);
  const result = Object.values(fused.characterProgression.instances).find((record) => record.cardId === 'lise_S');
  assert.equal(result.level, 60); assert.equal(result.breakthroughCount, 2);
  assert.deepEqual(result.breakthroughBonuses, { hp: 40, atk: 12, def: 4, mp: 6 });
});
