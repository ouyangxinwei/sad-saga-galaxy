import { RELICS } from './gameData.js';

export const EQUIPMENT_SCHEMA_VERSION = 1;
export const EQUIPMENT_SLOTS = Object.freeze(['weapon', 'armor', 'relic']);
export const EMPTY_EQUIPMENT_LOADOUT = Object.freeze({ weapon: null, armor: null, relic: null });

function inventoryForSlot(state, slot) {
  if (slot === 'relic') return state?.relics || {};
  return state?.equipmentInventory?.[slot] || {};
}

export function getEquippedItem(state, cardId, slot) {
  if (!EQUIPMENT_SLOTS.includes(slot)) return null;
  const loadout = state?.equipped?.[cardId];
  if (typeof loadout === 'string') return slot === 'relic' ? loadout : null;
  return loadout?.[slot] || null;
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
      if ((Number(inventory[itemId]) || 0) < 1 || claimed.has(uniqueKey)) return;
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
  const inventory = inventoryForSlot(normalized, slot);
  if ((Number(inventory[itemId]) || 0) < 1) return { ok: false, reason: 'not_owned', state: normalized };
  const otherWearer = Object.entries(normalized.equipped).find(
    ([otherCardId, loadout]) => otherCardId !== cardId && loadout?.[slot] === itemId,
  );
  if (otherWearer) return { ok: false, reason: 'already_equipped', state: normalized };
  nextLoadout[slot] = itemId;
  return { ok: true, reason: null, state: { ...normalized, equipped: { ...normalized.equipped, [cardId]: nextLoadout } } };
}
