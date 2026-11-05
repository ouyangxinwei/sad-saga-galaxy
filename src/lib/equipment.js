/**
 * 装备/遗物状态与属性效果模块。
 *
 * 负责装备槽位、库存校验、旧版遗物存档兼容、穿戴/卸下，以及把装备配置
 * 汇总为角色属性加成和战斗事件效果。这里不执行战斗事件；触发时机和结算由 battle.js
 * 与装备战斗运行时负责。
 *
 * 兼容重点：旧版 equipped 字符串代表遗物槽；归一化会迁移旧遗物持有关系，
 * 并确保同一件装备不会同时穿在多个角色身上。
 */
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

/** 按槽位和物品 ID 查找静态装备定义；非法槽位或未知 ID 返回 null。 */
export function getEquipmentDefinition(slot, itemId) {
  if (!EQUIPMENT_SLOTS.includes(slot) || !itemId) return null;
  return (EQUIPMENT_CATALOG[slot] || []).find((item) => item.id === itemId) || null;
}

/** 读取角色指定槽位装备，并兼容旧存档中 equipped[cardId] 为字符串的形式。 */
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

/** 归一化装备库存与穿戴关系，迁移旧遗物数据并清除无效/重复穿戴。 */
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

/** 穿戴或卸下装备；检查槽位、定义、库存及是否已被其他角色占用。 */
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

/** 收集已穿戴装备声明的战斗事件效果，交由战斗层在对应事件触发。 */
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
