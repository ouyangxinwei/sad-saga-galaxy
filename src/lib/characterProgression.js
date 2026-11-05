/**
 * 角色独立成长规则与实例数据层。
 *
 * 每一张重复角色卡都对应独立 progression record（instanceId）；角色定义 ID
 * 仍用于队伍编成与碎片归属。此模块负责记录归一化、经验升级、突破、融合成长
 * 继承和最强实例选择，不负责页面展示或存档写入。
 *
 * 关键边界：等级上限处的剩余经验保留；突破不重置等级；融合消耗较弱的来源实例，
 * 并在来源/结果已有实例之间保留成长最高者。变更这些规则时同步检查专项测试。
 */
import { HEROES } from './gameData.js';
/** progression 子结构自己的版本号，与应用版本及整个存档 schema 不是同一概念。 */
export const CHARACTER_PROGRESSION_SCHEMA_VERSION = 1;
export const INITIAL_CHARACTER_LEVEL = 1;
export const INITIAL_CHARACTER_LEVEL_CAP = 60;

/** 各职业原型每升一级的 HP/ATK/DEF/MP 线性成长率；数值以倍率增量表示。 */
export const CHARACTER_CAREER_GROWTH = Object.freeze({
  attack: Object.freeze({ hp: 0.003, atk: 0.0055, def: 0.0025, mp: 0.0035 }),
  defense: Object.freeze({ hp: 0.0055, atk: 0.0025, def: 0.0055, mp: 0.0035 }),
  support: Object.freeze({ hp: 0.0035, atk: 0.0025, def: 0.0035, mp: 0.0055 }),
  balanced: Object.freeze({ hp: 0.004, atk: 0.004, def: 0.004, mp: 0.004 }),
});
/** 将角色职业映射到成长原型；未列出的职业使用 balanced。 */
export const CHARACTER_CLASS_ARCHETYPES = Object.freeze({
  sword: 'attack', lancer: 'attack', archer: 'attack', rogue: 'attack', mage: 'attack',
  guardian: 'defense',
  priest: 'support', alchemist: 'support', stargazer: 'support',
});
/** 返回职业成长原型，未知 classId 安全回退为 balanced。 */
export function getCharacterCareerArchetype(classId) {
  return CHARACTER_CLASS_ARCHETYPES[classId] || 'balanced';
}

/** 每次突破按成长原型追加的固定属性；累计值记录在角色实例上。 */
export const CHARACTER_BREAKTHROUGH_REWARDS = Object.freeze({
  attack: Object.freeze({ hp: 20, atk: 6, def: 2, mp: 3 }),
  defense: Object.freeze({ hp: 35, atk: 2, def: 6, mp: 3 }),
  support: Object.freeze({ hp: 20, atk: 2, def: 3, mp: 8 }),
  balanced: Object.freeze({ hp: 25, atk: 4, def: 4, mp: 4 }),
});
export function characterClassIdFor(state, cardId) {
  return state?.customDefs?.[cardId]?.classId || HEROES.find((hero) => hero.id === cardId)?.classId || null;
}
export function characterBreakthroughReward(classId) {
  return CHARACTER_BREAKTHROUGH_REWARDS[getCharacterCareerArchetype(classId)];
}
export function getCharacterBreakthroughBonuses(record, classId) {
  const count = Math.max(0, Math.floor(Number(record?.breakthroughCount) || 0));
  const reward = characterBreakthroughReward(classId);
  const stored = record?.breakthroughBonuses;
  return Object.fromEntries(['hp', 'atk', 'def', 'mp'].map((stat) => [
    stat, stored && Number.isFinite(Number(stored[stat]))
      ? Math.max(0, Number(stored[stat])) : reward[stat] * count,
  ]));
}
export function characterGrowthMultipliers(classId, level = INITIAL_CHARACTER_LEVEL) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || INITIAL_CHARACTER_LEVEL));
  const levelSteps = safeLevel - INITIAL_CHARACTER_LEVEL;
  const rates = CHARACTER_CAREER_GROWTH[getCharacterCareerArchetype(classId)];
  return Object.fromEntries(Object.entries(rates).map(([stat, rate]) => [stat, 1 + levelSteps * rate]));
}

// Phase 1 records the confirmed growth policies as data-layer configuration.
// Runtime enforcement is intentionally left to the later progression phases.
export const CHARACTER_GROWTH_RULES = Object.freeze({
  breakthroughLevel: 'keep',
  breakthroughLimit: 'unlimited',
  breakthroughRequirement: 'materials',
  maxLevelExp: 'store',
  duplicateFusionGrowth: 'strongest',
});

export function createCharacterProgressionRecord(cardId, instanceId, instanceNumber = 1) {
  if (!cardId || !instanceId) throw new Error('cardId and instanceId are required');
  return {
    instanceId,
    cardId,
    instanceNumber,
    level: INITIAL_CHARACTER_LEVEL,
    exp: 0,
    breakthroughCount: 0,
    levelCap: INITIAL_CHARACTER_LEVEL_CAP,
    breakthroughBonuses: { hp: 0, atk: 0, def: 0, mp: 0 },
  };
}

/**
 * Adds independent progression records for every owned card copy represented by
 * the legacy cardCounts inventory. Existing records are never discarded here:
 * fusion/removal flows will explicitly decide which instances are consumed in a
 * later progression phase.
 */
/** 将旧卡牌持有数量补齐为独立实例，并修正已有实例字段；不会在此删除实例。 */
export function normalizeCharacterProgressionState(state) {
  if (!state || typeof state !== 'object') return state;

  const current = state.characterProgression && typeof state.characterProgression === 'object'
    ? state.characterProgression
    : {};
  const instances = { ...(current.instances || {}) };
  const ownedCards = state.cards && typeof state.cards === 'object' ? state.cards : {};
  const cardCounts = state.cardCounts && typeof state.cardCounts === 'object' ? state.cardCounts : {};

  Object.entries(ownedCards).forEach(([cardId, owned]) => {
    if (!owned) return;

    const rawCount = Number(cardCounts[cardId]);
    const targetCount = Math.max(1, Number.isFinite(rawCount) ? Math.floor(rawCount) : 1);
    const existing = Object.entries(instances)
      .filter(([, record]) => record && record.cardId === cardId)
      .map(([key, record]) => ({ key, record }));

    existing.forEach(({ key, record }) => {
      const level = Math.max(1, Math.floor(Number(record.level) || INITIAL_CHARACTER_LEVEL));
      const levelCap = Math.max(INITIAL_CHARACTER_LEVEL_CAP, level, Math.floor(Number(record.levelCap) || INITIAL_CHARACTER_LEVEL_CAP));
      const breakthroughCount = Math.max(0, Math.floor(Number(record.breakthroughCount) || 0));
      instances[key] = {
        ...record, instanceId: record.instanceId || key, cardId,
        instanceNumber: Math.max(1, Math.floor(Number(record.instanceNumber) || 1)),
        level, exp: Math.max(0, Math.floor(Number(record.exp) || 0)),
        breakthroughCount, levelCap,
        breakthroughBonuses: getCharacterBreakthroughBonuses(
          { ...record, breakthroughCount }, characterClassIdFor(state, cardId),
        ),
      };
    });

    let nextNumber = existing.reduce((max, item) => Math.max(max, Number(item.record.instanceNumber) || 0), 0) + 1;
    let count = existing.length;
    while (count < targetCount) {
      const instanceId = `card:${encodeURIComponent(cardId)}:${nextNumber}`;
      if (!instances[instanceId]) {
        instances[instanceId] = createCharacterProgressionRecord(cardId, instanceId, nextNumber);
        count += 1;
      }
      nextNumber += 1;
    }
  });

  return {
    ...state,
    characterProgression: {
      ...current,
      schemaVersion: CHARACTER_PROGRESSION_SCHEMA_VERSION,
      instances,
    },
  };
}

/** 当前等级升到下一级所需经验；参数为升级前等级。 */
export const characterExpNeed = (level) => Math.round(70 + level * 26 + level * level * 0.9);

/**
 * Adds character EXP to one progression instance. EXP remaining at the current
 * level cap is deliberately retained so a later breakthrough can consume it.
 */
export function addCharacterExperience(record, amount) {
  if (!record || !Number.isFinite(Number(amount)) || Number(amount) < 0 || (Number(amount) === 0 && Number(record.exp) <= 0)) {
    return { record, levelsGained: 0, expGained: 0 };
  }
  const expGained = Math.max(0, Math.floor(Number(amount)));
  let level = Math.max(1, Math.floor(Number(record.level) || INITIAL_CHARACTER_LEVEL));
  const levelCap = Math.max(level, Math.floor(Number(record.levelCap) || INITIAL_CHARACTER_LEVEL_CAP));
  let exp = Math.max(0, Math.floor(Number(record.exp) || 0)) + expGained;
  let levelsGained = 0;

  while (level < levelCap) {
    const required = characterExpNeed(level);
    if (exp < required) break;
    exp -= required;
    level += 1;
    levelsGained += 1;
  }

  return {
    record: { ...record, level, levelCap, exp },
    levelsGained,
    expGained,
  };
}

/**
 * Awards EXP to each deployed character's strongest owned card instance.
 * Party slots are keyed by card definition, so duplicate copies are not
 * double-awarded; tie-breakers are current EXP then breakthrough count.
 */
/** 将战斗经验发给上阵角色各自最强的一个实例；同角色重复卡不会重复领奖。 */
export function grantPartyCharacterExperience(state, amount) {
  if (!state || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return { state, levelsGained: 0, recipients: [] };
  }
  const progression = state.characterProgression;
  if (!progression?.instances) return { state, levelsGained: 0, recipients: [] };

  const instances = { ...progression.instances };
  const recipients = [];
  let levelsGained = 0;

  [...new Set((state.party || []).filter(Boolean))].forEach((cardId) => {
    const candidates = Object.entries(instances)
      .filter(([, record]) => record?.cardId === cardId)
      .sort((a, b) =>
        (Number(b[1].level) || 1) - (Number(a[1].level) || 1) ||
        (Number(b[1].exp) || 0) - (Number(a[1].exp) || 0) ||
        (Number(b[1].breakthroughCount) || 0) - (Number(a[1].breakthroughCount) || 0) ||
        String(a[0]).localeCompare(String(b[0]))
      );
    if (!candidates.length) return;
    const [instanceId, current] = candidates[0];
    const result = addCharacterExperience(current, amount);
    instances[instanceId] = result.record;
    levelsGained += result.levelsGained;
    recipients.push({ cardId, instanceId, expGained: result.expGained, levelsGained: result.levelsGained });
  });

  return {
    state: { ...state, characterProgression: { ...progression, instances } },
    levelsGained,
    recipients,
  };
}


/** 计算下一次突破消耗：碎片随突破次数递增，金币按次数线性递增。 */
export function characterBreakthroughCost(breakthroughCount = 0) {
  const count = Math.max(0, Math.floor(Number(breakthroughCount) || 0));
  return { shards: 3 + count * 2, gold: 1000 * (count + 1) };
}

/** 选择同一角色成长最高的实例；等级、经验、突破次数依次作为排序条件。 */
export function strongestCharacterInstance(state, cardId) {
  const instances = state?.characterProgression?.instances || {};
  return Object.entries(instances).filter(([, record]) => record?.cardId === cardId).sort((a, b) =>
    (Number(b[1].level) || 1) - (Number(a[1].level) || 1) ||
    (Number(b[1].exp) || 0) - (Number(a[1].exp) || 0) ||
    (Number(b[1].breakthroughCount) || 0) - (Number(a[1].breakthroughCount) || 0) ||
    String(a[0]).localeCompare(String(b[0]))
  )[0] || null;
}


/**
 * Fuses card progression without losing growth. The three weakest source copies
 * are consumed; the strongest progression among those copies and already-owned
 * result copies is retained. A winning source record is rebound to a fresh
 * result-card instance ID. If an existing result copy wins, it stays untouched
 * and normalization creates the newly fused copy at its initial growth.
 */
/** 预览三合一等融合将消耗哪些来源实例，以及哪份成长记录会被保留。 */
export function previewFusionCharacterProgression(state, sourceCardId, resultCardId, count = 3) {
  const instances = state?.characterProgression?.instances || {};
  const amount = Math.max(0, Math.floor(Number(count) || 0));
  const all = Object.entries(instances);
  const sourceCandidates = all
    .filter(([, record]) => record?.cardId === sourceCardId)
    .sort((a, b) =>
      (Number(a[1].level) || 1) - (Number(b[1].level) || 1) ||
      (Number(a[1].exp) || 0) - (Number(b[1].exp) || 0) ||
      (Number(a[1].breakthroughCount) || 0) - (Number(b[1].breakthroughCount) || 0) ||
      (Number(a[1].levelCap) || INITIAL_CHARACTER_LEVEL_CAP) - (Number(b[1].levelCap) || INITIAL_CHARACTER_LEVEL_CAP) ||
      String(a[0]).localeCompare(String(b[0]))
    );
  const consumed = sourceCandidates.slice(0, amount);
  const resultCandidates = all
    .filter(([, record]) => record?.cardId === resultCardId)
    .map(([instanceId, record]) => ({ instanceId, record, origin: 'result' }));
  const sourceGrowth = consumed.map(([instanceId, record]) => ({ instanceId, record, origin: 'source' }));
  const compareGrowth = (a, b) =>
    (Number(b.record.level) || 1) - (Number(a.record.level) || 1) ||
    (Number(b.record.exp) || 0) - (Number(a.record.exp) || 0) ||
    (Number(b.record.breakthroughCount) || 0) - (Number(a.record.breakthroughCount) || 0) ||
    (Number(b.record.levelCap) || INITIAL_CHARACTER_LEVEL_CAP) - (Number(a.record.levelCap) || INITIAL_CHARACTER_LEVEL_CAP) ||
    ((a.origin === 'result' ? 0 : 1) - (b.origin === 'result' ? 0 : 1));
  const winner = [...sourceGrowth, ...resultCandidates].sort(compareGrowth)[0] || null;
  return {
    canPreview: amount > 0 && sourceCandidates.length >= amount,
    consumedCount: consumed.length,
    sourceCopyCount: sourceCandidates.length,
    resultCopyCount: resultCandidates.length,
    winner: winner ? { ...winner } : null,
  };
}

/** 正式执行成长记录融合；来源胜出时重绑为结果角色的新实例 ID。 */
export function fuseCharacterProgressionInstances(state, sourceCardId, resultCardId, count = 3) {
  const progression = state?.characterProgression;
  if (!progression?.instances || !sourceCardId || !resultCardId) return state;
  const amount = Math.max(0, Math.floor(Number(count) || 0));
  if (!amount) return state;

  const compareGrowth = (a, b) =>
    (Number(b.record.level) || 1) - (Number(a.record.level) || 1) ||
    (Number(b.record.exp) || 0) - (Number(a.record.exp) || 0) ||
    (Number(b.record.breakthroughCount) || 0) - (Number(a.record.breakthroughCount) || 0) ||
    (Number(b.record.levelCap) || INITIAL_CHARACTER_LEVEL_CAP) - (Number(a.record.levelCap) || INITIAL_CHARACTER_LEVEL_CAP) ||
    ((a.origin === 'result' ? 0 : 1) - (b.origin === 'result' ? 0 : 1));

  const all = Object.entries(progression.instances);
  const sourceCandidates = all
    .filter(([, record]) => record?.cardId === sourceCardId)
    .sort((a, b) =>
      (Number(a[1].level) || 1) - (Number(b[1].level) || 1) ||
      (Number(a[1].exp) || 0) - (Number(b[1].exp) || 0) ||
      (Number(a[1].breakthroughCount) || 0) - (Number(b[1].breakthroughCount) || 0) ||
      (Number(a[1].levelCap) || INITIAL_CHARACTER_LEVEL_CAP) - (Number(b[1].levelCap) || INITIAL_CHARACTER_LEVEL_CAP) ||
      String(a[0]).localeCompare(String(b[0]))
    );
  const consumed = sourceCandidates.slice(0, amount);
  const resultCandidates = all
    .filter(([, record]) => record?.cardId === resultCardId)
    .map(([instanceId, record]) => ({ instanceId, record, origin: 'result' }));
  const sourceGrowth = consumed.map(([instanceId, record]) => ({ instanceId, record, origin: 'source' }));
  const winner = [...sourceGrowth, ...resultCandidates].sort(compareGrowth)[0] || null;

  const instances = { ...progression.instances };
  consumed.forEach(([instanceId]) => { delete instances[instanceId]; });

  if (winner?.origin === 'source') {
    let nextNumber = all
      .filter(([, record]) => record?.cardId === resultCardId)
      .reduce((max, [, record]) => Math.max(max, Number(record.instanceNumber) || 0), 0) + 1;
    let instanceId = `card:${encodeURIComponent(resultCardId)}:${nextNumber}`;
    while (instances[instanceId]) {
      nextNumber += 1;
      instanceId = `card:${encodeURIComponent(resultCardId)}:${nextNumber}`;
    }
    instances[instanceId] = {
      ...winner.record,
      instanceId,
      cardId: resultCardId,
      instanceNumber: nextNumber,
    };
  }

  return {
    ...state,
    characterProgression: { ...progression, instances },
  };
}

/** 对角色最强实例执行突破；必须满当前等级上限且碎片/金币充足。 */
export function breakthroughCharacter(state, cardId) {
  const selected = strongestCharacterInstance(state, cardId);
  if (!selected) return { state, success: false, reason: 'missing-character' };
  const [instanceId, record] = selected;
  if (record.level < record.levelCap) return { state, success: false, reason: 'level-cap-not-reached', record };
  const cost = characterBreakthroughCost(record.breakthroughCount);
  const shards = Number(state.cardShards?.[cardId]) || 0;
  const gold = Number(state.gold) || 0;
  if (shards < cost.shards || gold < cost.gold) return { state, success: false, reason: 'insufficient-materials', cost, record };
  const classId = characterClassIdFor(state, cardId);
  const reward = characterBreakthroughReward(classId);
  const currentBonuses = getCharacterBreakthroughBonuses(record, classId);
  const breakthroughBonuses = Object.fromEntries(['hp', 'atk', 'def', 'mp'].map((stat) => [stat, currentBonuses[stat] + reward[stat]]));
  const raised = {
    ...record, breakthroughCount: record.breakthroughCount + 1,
    levelCap: record.levelCap + 10, breakthroughBonuses,
  };
  const progressed = addCharacterExperience(raised, 0).record;
  return {
    state: {
      ...state,
      gold: gold - cost.gold,
      cardShards: { ...(state.cardShards || {}), [cardId]: shards - cost.shards },
      characterProgression: { ...state.characterProgression, instances: { ...state.characterProgression.instances, [instanceId]: progressed } },
    },
    success: true, cost, record: progressed, instanceId,
  };
}
