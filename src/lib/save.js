import { logWarn, traceSync } from './logger';
import { normalizeEquipmentState } from './equipment';
import {
  DEFAULT_UNLOCKED,
  STAGES_PER_MODE,
  MODES,
  BOUNTY_TEMPLATES,
} from './gameData';

export const SAVE_KEY = 'saga_galaxy_save_v20';
export const EQUIPMENT_BACKUP_KEY = 'saga_galaxy_save_v20_equipment_backup_v1';
let saveWritesBlocked = false;
export const STAMINA_MAX = 60;
export const STAMINA_MS = 180000; // 1 per 3 min

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function bountySlot(ts = Date.now()) {
  return Math.floor(ts / (4 * 3600 * 1000));
}

export function generateBounties(slot = bountySlot()) {
  const list = [];
  for (let i = 0; i < 3; i += 1) {
    const tpl = BOUNTY_TEMPLATES[(slot * 2 + i * 2 + 1) % BOUNTY_TEMPLATES.length];
    list.push({ id: `${slot}-${i}`, tplId: tpl.id, cardId: null, startedAt: null, endsAt: null });
  }
  return list;
}

function defaultStateImpl() {
  const cards = {};
  const cardCounts = {};
  DEFAULT_UNLOCKED.forEach((id) => {
    cards[id] = true;
    cardCounts[id] = 1;
  });
  return {
    version: 20,
    lang: 'zh',
    level: 1,
    exp: 0,
    rebirth: 0,
    classId: 'sword',
    gold: 3200,
    gems: 1500,
    tickets: 12,
    stamina: STAMINA_MAX,
    staminaAt: Date.now(),
    medals: 0,
    cards,
    cardCounts,
    cardShards: {},
    enemyShards: {},
    codex: {},
    customDefs: {},
    party: [...DEFAULT_UNLOCKED],
    presets: [[...DEFAULT_UNLOCKED], [], []],
    presetIndex: 0,
    progress: { normal: 0, hard: 0, nightmare: 0 },
    tower: 0,
    eventClears: 0,
    pity: 0,
    ssTokens: 0,
    checkin: { last: null, streak: 0 },
    fortune: { date: null, id: null },
    msClaimed: { heroes: [], enemies: [] },
    idle: { active: true, at: Date.now(), elapsedSeconds: 0 },
    bounties: { slot: bountySlot(), list: generateBounties() },
    relics: {},
    equipped: {},
    shopBought: {},
    settings: { speed: 1 },
  };
}

function loadStateImpl() {
  saveWritesBlocked = false;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const cardCounts = { ...base.cardCounts, ...(parsed.cardCounts || {}) };
    if (!parsed.cardCounts) {
      Object.keys(parsed.cards || {}).forEach((id) => { cardCounts[id] = cardCounts[id] || 1; });
    }
    const merged = {
      ...base, ...parsed,
      progress: { ...base.progress, ...(parsed.progress || {}) },
      checkin: { ...base.checkin, ...(parsed.checkin || {}) },
      fortune: { ...base.fortune, ...(parsed.fortune || {}) },
      idle: { ...base.idle, ...(parsed.idle || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      msClaimed: { ...base.msClaimed, ...(parsed.msClaimed || {}) },
      bounties: { ...base.bounties, ...(parsed.bounties || {}) },
      cards: { ...base.cards, ...(parsed.cards || {}) },
      cardCounts,
    };
    if (Number(parsed.equipmentSchemaVersion || 0) < 1 && !localStorage.getItem(EQUIPMENT_BACKUP_KEY)) {
      localStorage.setItem(EQUIPMENT_BACKUP_KEY, raw);
    }
    return normalizeEquipmentState(merged);
  } catch (e) {
    saveWritesBlocked = true;
    logWarn('Save', 'loadState', { message: e?.message || String(e), recovery: 'Original local save was left untouched.' });
    return defaultState();
  }
}
function persistImpl(state) {
  if (saveWritesBlocked) return false;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}

function clearSaveImpl() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    /* noop */
  }
}

export function defaultState() { return traceSync('Save.defaultState', () => defaultStateImpl()); }
export function loadState() { return traceSync('Save.loadState', () => loadStateImpl()); }
export function persist(state) { return traceSync('Save.persist', () => persistImpl(state), { hasState: Boolean(state) }); }
export function clearSave() { return traceSync('Save.clearSave', () => clearSaveImpl()); }

export function currentStamina(state, now = Date.now()) {
  const elapsed = Math.max(0, now - (state.staminaAt || now));
  const gained = Math.floor(elapsed / STAMINA_MS);
  const stamina = Math.min(STAMINA_MAX, state.stamina + gained);
  return { stamina, staminaAt: stamina >= STAMINA_MAX ? now : state.staminaAt + gained * STAMINA_MS };
}

export function clearedCount(state) {
  return Object.values(state.progress).reduce((a, b) => a + b, 0);
}

export function highestTier(state) {
  let best = 0;
  MODES.forEach((m, i) => {
    const done = state.progress[m.id] || 0;
    if (done > 0) best = Math.max(best, i * STAGES_PER_MODE + done);
  });
  return Math.max(1, best);
}

export function nextStageTarget(state) {
  for (let i = 0; i < MODES.length; i += 1) {
    const mode = MODES[i];
    const done = state.progress[mode.id] || 0;
    if (done < STAGES_PER_MODE) return { mode: mode.id, n: done + 1 };
  }
  return null;
}