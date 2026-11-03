export const CHARACTER_PROGRESSION_SCHEMA_VERSION = 1;
export const INITIAL_CHARACTER_LEVEL = 1;
export const INITIAL_CHARACTER_LEVEL_CAP = 60;

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
  };
}

/**
 * Adds independent progression records for every owned card copy represented by
 * the legacy cardCounts inventory. Existing records are never discarded here:
 * fusion/removal flows will explicitly decide which instances are consumed in a
 * later progression phase.
 */
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
      instances[key] = {
        ...record,
        instanceId: record.instanceId || key,
        cardId,
        instanceNumber: Math.max(1, Math.floor(Number(record.instanceNumber) || 1)),
        level,
        exp: Math.max(0, Math.floor(Number(record.exp) || 0)),
        breakthroughCount: Math.max(0, Math.floor(Number(record.breakthroughCount) || 0)),
        levelCap,
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

export const characterExpNeed = (level) => Math.round(70 + level * 26 + level * level * 0.9);

/**
 * Adds character EXP to one progression instance. EXP remaining at the current
 * level cap is deliberately retained so a later breakthrough can consume it.
 */
export function addCharacterExperience(record, amount) {
  if (!record || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
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
