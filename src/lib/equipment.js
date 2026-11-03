import { EQUIPMENT_CATALOG, RELICS } from './gameData.js';

export const EQUIPMENT_SCHEMA_VERSION = 1;
export const EQUIPMENT_SLOTS = Object.freeze(['weapon', 'armor', 'relic']);
export const EMPTY_EQUIPMENT_LOADOUT = Object.freeze({ weapon: null, armor: null, relic: null });

export const EQUIPMENT_STAT_KEYS = Object.freeze([
  'hpPct', 'atkPct', 'defPct', 'spdPct', 'crit', 'critDamagePct',
  'healPct', 'mpCostReductionPct',
]);
export const EQUIPMENT_COMBAT_KEYS = Object.freeze([
  'damageDealtPct', 'damageReductionPct', 'healPct', 'critDamagePct', 'mpCostReductionPct',
]);

const LIMITS = Object.freeze({
  crit: [0, 0.75],
  critDamagePct: [0, 1.0],
  healPct: [0, 1.5],
  mpCostReductionPct: [0, 0.5],
  damageDealtPct: [0, 1.0],
  damageReductionPct: [0, 0.75],
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const safeAdd = (target, source, keys) => {
  keys.forEach((key) => { target[key] += Number(source?.[key]) || 0; });
};

function inventoryForSlot(state, slot) {
  if (slot === 'relic') return state?.relics || {};
  return state?.equipmentInventory?.[slot] || {};
}

export function getEquipmentDefinition(slot, itemId) {
  if (!EQUIPMENT_SLOTS.includes(slot) || !itemId) return null;
  return (EQUIPMENT_CATALOG[slot] || []).find((item) => item.id === itemId) || null;
}

export function getEquippedItem(state, cardId, slot) {
  if (!EQUIPMENT_SLOTS.includes(slot)) return null;
  const loadout = state?.equipped?.[cardId];
  if (typeof loadout === 'string') return slot === 'relic' ? loadout : null;
  return loadout?.[slot] || null;
}

/**
 * Returns additive equipment modifiers for one character.
 * Legacy relic fields are read as a fallback, preserving v0.31 and older saves.
 */
export function getEquipmentBonuses(state, cardId) {
  const result = {
    hpPct: 0, atkPct: 0, defPct: 0, spdPct: 0, crit: 0,
    critDamagePct: 0, healPct: 0, mpCostReductionPct: 0,
    damageDealtPct: 0, damageReductionPct: 0,
  };
  EQUIPMENT_SLOTS.forEach((slot) => {
    const itemId = getEquippedItem(state, cardId, slot);
    const item = getEquipmentDefinition(slot, itemId);
    if (!item) return;
    const legacyStats = {
      hpPct: item.hp, atkPct: item.atk, defPct: item.def, spdPct: item.spd,
    };
    const stats = { ...legacyStats, ...(item.stats || {}) };
    safeAdd(result, stats, EQUIPMENT_STAT_KEYS);
    safeAdd(result, item.combat, EQUIPMENT_COMBAT_KEYS.filter((key) => key !== 'critDamagePct' && key !== 'healPct' && key !== 'mpCostReductionPct'));
    // These shared keys are deliberately additive across the stat and combat channels.
    if (item.combat?.critDamagePct != null) result.critDamagePct += Number(item.combat.critDamagePct) || 0;
    if (item.combat?.healPct != null) result.healPct += Number(item.combat.healPct) || 0;
    if (item.combat?.mpCostReductionPct != null) result.mpCostReductionPct += Number(item.combat.mpCostReductionPct) || 0;
  });
  Object.entries(LIMITS).forEach(([key, [min, max]]) => { result[key] = clamp(result[key], min, max); });
  return result;
}

export function normalizeEquipmentState(state) {
  const source = state?.equipped && typeof state.equipped === 'object' ? state.equipped : {};
  const isLegacy = Number(state?.equipmentSchemaVersion || 0) < EQUIPMENT_SCHEMA_VERSION;
  const relics = { ...(state?.relics || {}) };
  const equipmentInventory = {
    weapon: { ...(state?.equipmentInventory?.weapon || {}) },
    armor: { ...(state?.equipmentInventory?.armor || {}) },
  };
  if (isLegacy) {
    Object.values(source).forEach((value) => {
      const relicId = typeof value === 'string' ? value : value?.relic;
      if (relicId && RELICS.some((item) => item.id === relicId)) {
        relics[relicId] = Math.max(1, Number(relics[relicId]) || 0);
      }
    });
  }
  const equipped = {};
  const claimed = new Set();
  Object.entries(source).forEach(([cardId, value]) => {
    const raw = typeof value === 'string' ? { relic: value } : (value || {});
    const loadout = { weapon: null, armor: null, relic: null };
    EQUIPMENT_SLOTS.forEach((slot) => {
      const itemId = typeof raw[slot] === 'string' ? raw[slot] : null;
      if (!itemId) return;
      const inventory = inventoryForSlot({ relics, equipmentInventory }, slot);
      const uniqueKey = slot + ':' + itemId;
      if (!getEquipmentDefinition(slot, itemId) || (Number(inventory[itemId]) || 0) < 1 || claimed.has(uniqueKey)) return;
      loadout[slot] = itemId;
      claimed.add(uniqueKey);
    });
    equipped[cardId] = loadout;
  });
  return { ...state, equipmentSchemaVersion: EQUIPMENT_SCHEMA_VERSION, equipmentInventory, relics, equipped };
}

export function equipItem(state, cardId, slot, itemId) {
  if (!cardId || !EQUIPMENT_SLOTS.includes(slot)) return { ok: false, reason: 'invalid_target', state };
  const normalized = normalizeEquipmentState(state);
  const nextLoadout = { ...(normalized.equipped[cardId] || EMPTY_EQUIPMENT_LOADOUT) };
  if (!itemId) {
    nextLoadout[slot] = null;
    return { ok: true, reason: null, state: { ...normalized, equipped: { ...normalized.equipped, [cardId]: nextLoadout } } };
  }
  if (!getEquipmentDefinition(slot, itemId)) return { ok: false, reason: 'invalid_item', state: normalized };
  const inventory = inventoryForSlot(normalized, slot);
  if ((Number(inventory[itemId]) || 0) < 1) return { ok: false, reason: 'not_owned', state: normalized };
  const otherWearer = Object.entries(normalized.equipped).find(
    ([otherCardId, loadout]) => otherCardId !== cardId && loadout?.[slot] === itemId,
  );
  if (otherWearer) return { ok: false, reason: 'already_equipped', state: normalized };
  nextLoadout[slot] = itemId;
  return { ok: true, reason: null, state: { ...normalized, equipped: { ...normalized.equipped, [cardId]: nextLoadout } } };
}

export function getEquipmentEffects(state, cardId) {
  const effects = [];
  EQUIPMENT_SLOTS.forEach((slot) => {
    const itemId = getEquippedItem(state, cardId, slot);
    const item = getEquipmentDefinition(slot, itemId);
    (item?.effects || []).forEach((effect) => {
      if (effect?.event && effect?.effect?.type) effects.push({ ...effect, itemId, itemName: item.name });
    });
  });
  return effects;
}
