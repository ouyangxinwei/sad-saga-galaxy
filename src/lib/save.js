/**
 * 玩家本地存档边界（Persistence Layer）。
 *
 * 本模块负责默认状态、读取/写入、存档替换与导入导出。
 * 游戏业务代码应通过这里导出的函数访问存档，不要在页面中散落
 * localStorage key 或自行拼装迁移逻辑。
 *
 * SAVE_SCHEMA_VERSION 表示存档结构版本，不等同于应用 package 版本。
 * 修改默认字段或结构时，必须考虑旧版本存档的归一化与导入兼容；
 * 写入失败或存档异常时，应优先保护原始存档，避免覆盖可恢复数据。
 */
import { logWarn, traceSync } from './logger.js';
import { normalizeEquipmentState } from './equipment.js';
import { RESET_GEMS, createResetState, persistResetState } from './resetState.js';
import { normalizeCharacterProgressionState } from './characterProgression.js';
import { createDefaultFormationState, normalizeFormationState } from './formationSystem.js';
import {
  DEFAULT_UNLOCKED,
  STAGES_PER_MODE,
  MODES,
  BOUNTY_TEMPLATES,
} from './gameData.js';

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

/** 创建一份全新的初始玩家状态；新增持久化字段应在此提供默认值。 */
function defaultStateImpl() {
  const cards = {};
  const cardCounts = {};
  DEFAULT_UNLOCKED.forEach((id) => {
    cards[id] = true;
    cardCounts[id] = 1;
  });
  const state = {
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
    idleGems: 1000,
    idleGemStats: { earnedFromWins: 0, earnedFromLosses: 0, spent: 0 },
    idleGemHistory: [],
    clearGems: 0,
    clearGemStats: { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, earnedFromIdle: 0 },
    clearGemHistory: [],
    medals: 0,
    cards,
    cardCounts,
    cardShards: {},
    enemyShards: {},
    codex: {},
    customDefs: {},
    party: [...DEFAULT_UNLOCKED],
    formation: createDefaultFormationState(DEFAULT_UNLOCKED),
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
    equipmentSchemaVersion: 1,
    equipmentInventory: { weapon: {}, armor: {} },
    equipped: {},
    shopBought: {},
    settings: { speed: 1 },
  };
  return normalizeCharacterProgressionState(state);
}

/** 读取并归一化本地存档；异常时保护原始数据并返回可运行的默认状态。 */
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
      equipmentSchemaVersion: Number(parsed.equipmentSchemaVersion || 0),
      progress: { ...base.progress, ...(parsed.progress || {}) },
      checkin: { ...base.checkin, ...(parsed.checkin || {}) },
      fortune: { ...base.fortune, ...(parsed.fortune || {}) },
      idle: { ...base.idle, ...(parsed.idle || {}) },
      clearGemStats: { ...base.clearGemStats, ...(parsed.clearGemStats || {}) },
      clearGemHistory: Array.isArray(parsed.clearGemHistory) ? parsed.clearGemHistory : base.clearGemHistory,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      msClaimed: { ...base.msClaimed, ...(parsed.msClaimed || {}) },
      bounties: { ...base.bounties, ...(parsed.bounties || {}) },
      cards: { ...base.cards, ...(parsed.cards || {}) },
      cardCounts,
      formation: normalizeFormationState(parsed.formation, parsed.party || base.party),
    };
    if (Number(parsed.equipmentSchemaVersion || 0) < 1 && !localStorage.getItem(EQUIPMENT_BACKUP_KEY)) {
      localStorage.setItem(EQUIPMENT_BACKUP_KEY, raw);
    }
    return normalizeCharacterProgressionState(normalizeEquipmentState(merged));
  } catch (e) {
    saveWritesBlocked = true;
    logWarn('Save', 'loadState', { message: e?.message || String(e), recovery: 'Original local save was left untouched.' });
    return defaultState();
  }
}
/** 将完整状态序列化写入本地存储；返回布尔值供调用方判断是否成功。 */
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
    saveWritesBlocked = false;
  } catch (e) {
    /* noop */
  }
}

export function defaultState() { return traceSync('Save.defaultState', () => defaultStateImpl()); }
export function resetState() { return traceSync('Save.resetState', () => createResetState(defaultStateImpl())); }
export function replaceSave(state) {
  return traceSync('Save.replaceSave', () => {
    const saved = persistResetState(localStorage, SAVE_KEY, state);
    if (saved) saveWritesBlocked = false;
    else logWarn('Save', 'replaceSave', { message: 'Unable to write reset save.' });
    return saved;
  }, { hasState: Boolean(state) });
}
export function loadState() { return traceSync('Save.loadState', () => loadStateImpl()); }
export function persist(state) { return traceSync('Save.persist', () => persistImpl(state), { hasState: Boolean(state) }); }
export function clearSave() { return traceSync('Save.clearSave', () => clearSaveImpl()); }

/** 按经过时间计算自然恢复后的体力，不直接修改传入的存档对象。 */
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

// V7 Phase 5: portable save backup and transactional restore.
export const SAVE_EXPORT_FORMAT = 'sad-saga-galaxy-save';
export const SAVE_SCHEMA_VERSION = 20;

/** 校验备份文件格式与 schema 版本；只解析，不触碰当前玩家存档。 */
function parseSavePayload(input) {
  let parsed;
  try { parsed = typeof input === 'string' ? JSON.parse(input) : input; }
  catch { throw new Error('invalid-json'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid-format');
  let save = parsed, appVersion = null, exportedAt = null;
  if (Object.prototype.hasOwnProperty.call(parsed, 'format')) {
    if (parsed.format !== SAVE_EXPORT_FORMAT || !parsed.save || typeof parsed.save !== 'object') throw new Error('invalid-format');
    save = parsed.save;
    appVersion = typeof parsed.appVersion === 'string' ? parsed.appVersion : null;
    exportedAt = typeof parsed.exportedAt === 'string' ? parsed.exportedAt : null;
  }
  if (!save || typeof save !== 'object' || Array.isArray(save)) throw new Error('invalid-format');
  const schemaVersion = Number(save.version);
  if (!Number.isFinite(schemaVersion) || schemaVersion < 1 || schemaVersion > SAVE_SCHEMA_VERSION) throw new Error(schemaVersion > SAVE_SCHEMA_VERSION ? 'unsupported-version' : 'invalid-save');
  if (!save.cards || typeof save.cards !== 'object' || Array.isArray(save.cards)) throw new Error('invalid-save');
  if (!save.progress || typeof save.progress !== 'object' || Array.isArray(save.progress)) throw new Error('invalid-save');
  if (!Number.isFinite(Number(save.level)) || !Number.isFinite(Number(save.gold))) throw new Error('invalid-save');
  return { save, appVersion, exportedAt, schemaVersion };
}

/** 将旧版/外部存档补齐到当前字段结构，并运行装备、角色成长归一化。 */
function normalizeImportedSave(parsed) {
  const base = defaultState();
  const cardCounts = { ...base.cardCounts, ...(parsed.cardCounts || {}) };
  if (!parsed.cardCounts) Object.keys(parsed.cards || {}).forEach((id) => { cardCounts[id] = cardCounts[id] || 1; });
  const merged = {
    ...base, ...parsed,
    equipmentSchemaVersion: Number(parsed.equipmentSchemaVersion || 0),
    progress: { ...base.progress, ...(parsed.progress || {}) },
    checkin: { ...base.checkin, ...(parsed.checkin || {}) },
    fortune: { ...base.fortune, ...(parsed.fortune || {}) },
    idle: { ...base.idle, ...(parsed.idle || {}) },
    settings: { ...base.settings, ...(parsed.settings || {}) },
    msClaimed: { ...base.msClaimed, ...(parsed.msClaimed || {}) },
    bounties: { ...base.bounties, ...(parsed.bounties || {}) },
    cards: { ...base.cards, ...(parsed.cards || {}) },
    cardCounts,
    formation: normalizeFormationState(parsed.formation, parsed.party || base.party),
  };
  return normalizeCharacterProgressionState(normalizeEquipmentState(merged));
}

export function summarizeSaveState(state) {
  const owned = Object.keys(state?.cards || {}).filter((id) => Boolean(state.cards[id]));
  const counts = state?.cardCounts || {};
  const characterCopies = owned.reduce((sum, id) => sum + Math.max(1, Math.floor(Number(counts[id]) || 1)), 0);
  const progress = state?.progress || {};
  return {
    characterCount: owned.length, characterCopies,
    gold: Math.max(0, Number(state?.gold) || 0),
    gems: Math.max(0, Number(state?.gems) || 0),
    tickets: Math.max(0, Number(state?.tickets) || 0),
    stamina: Math.max(0, Number(state?.stamina) || 0),
    medals: Math.max(0, Number(state?.medals) || 0),
    normal: Math.max(0, Number(progress.normal) || 0),
    hard: Math.max(0, Number(progress.hard) || 0),
    nightmare: Math.max(0, Number(progress.nightmare) || 0),
    cleared: Object.values(progress).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0),
    tower: Math.max(0, Number(state?.tower) || 0),
    eventClears: Math.max(0, Number(state?.eventClears) || 0),
  };
}

export function exportSaveData(state, appVersion = 'unknown') {
  return {
    format: SAVE_EXPORT_FORMAT, formatVersion: 1, appVersion,
    saveSchemaVersion: Number(state?.version) || SAVE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    save: JSON.parse(JSON.stringify(state)),
  };
}

export function inspectSaveData(input) {
  const parsed = parseSavePayload(input);
  const state = normalizeImportedSave(parsed.save);
  return { success: true, state, metadata: {
    appVersion: parsed.appVersion || 'Legacy JSON',
    saveSchemaVersion: parsed.schemaVersion, exportedAt: parsed.exportedAt,
    ...summarizeSaveState(state),
  } };
}

/** 先完整校验和迁移，再一次性写入；校验失败时当前存档保持不变。 */
export function restoreSaveData(input) {
  let inspected;
  try { inspected = inspectSaveData(input); }
  catch (error) { return { success: false, reason: error?.message || 'invalid-save' }; }
  try {
    // Validate and migrate fully before touching the current local save.
    localStorage.setItem(SAVE_KEY, JSON.stringify(inspected.state));
    saveWritesBlocked = false;
    return { success: true, state: inspected.state, metadata: inspected.metadata };
  } catch (error) {
    return { success: false, reason: 'storage-write-failed', message: error?.message || String(error) };
  }
}
