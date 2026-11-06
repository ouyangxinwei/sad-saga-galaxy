/**
 * 游戏全局状态与业务用例中心（Application State / Use Cases）。
 *
 * GameProvider 持有当前玩家状态，并通过 Context 向页面提供业务操作。
 * 页面应调用本模块暴露的 action，而不是直接修改 state 或操作 localStorage。
 *
 * 核心数据流：
 * 页面事件 -> Context action -> 基于 ref.current 生成新状态
 * -> commit() 归一化并更新 React state/ref -> effect 持久化到 save.js。
 *
 * state 用于驱动 React 渲染；ref.current 用于在连续业务操作中同步读取
 * 最新状态，避免闭包拿到旧 state。任何状态写入都必须同步维护两者。
 *
 * 本文件包含跨模块编排（奖励、队伍、战斗结算、挂机等），具体算法尽量
 * 放在独立 lib 模块。修改业务规则时，应同时检查对应模块与存档兼容。
 */
import { logInfo, logWarn, traceSync } from './logger';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { translate } from './i18n';
import {
  BOUNTY_MAP,
  CHECKIN,
  ENEMY_MAP,
  FORTUNES,
  HEROES,
  MILESTONES,
  MODES,
  RARITY_NEXT,
  RELICS,
  STAGES_PER_MODE,
  upgradedId,
  upgradedName,
  classOf,
  classStats,
  convertClassFor,
  expNeed,
  levelCap,
  pickHero,
  pickRarity,
  getStage,
} from './gameData';
import {
  STAMINA_MAX,
  bountySlot,
  currentStamina,
  defaultState,
  generateBounties,
  loadState,
  persist,
  replaceSave,
  resetState,
  todayKey,
  exportSaveData,
  inspectSaveData,
  restoreSaveData,
} from './save';
import { APP_VERSION } from './version';
import { cardPower, copiesOf, getCardDef, partyPower, strongestParty, teamTotals } from './cards';
import { equipItem, getEquipmentDefinition, getEquippedItem } from './equipment';
import { getClearGemSettlementCount, isStageCleared } from './clearGemSystem';
import { getProgressAfterStageWin } from './stageProgression';
import { normalizeCharacterProgressionState, grantPartyCharacterExperience, breakthroughCharacter, fuseCharacterProgressionInstances } from './characterProgression';
import { applyResourceExchange } from './resourceExchange';
import { setActiveFormation as selectActiveFormation, setFormationPosition as assignFormationPosition, normalizeFormationState } from './formationSystem';
import { getCompletedIdleHours, rollIdleResourceDrops } from './idleRewards';

const GameCtx = createContext(null);
const traceAction = (name, fn) => (...args) => traceSync('GameContext.' + name, () => fn(...args));

const TEST_SUPPORT_KEY = 'oooo_v13_test_support_v1';
const TEST_TICKETS = 450;
const TEST_GEMS = 324000;
const TEST_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function readTestSupport() {
  try {
    const raw = localStorage.getItem(TEST_SUPPORT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed?.claimedAt) && Number.isFinite(parsed?.expiresAt) ? parsed : null;
  } catch {
    return null;
  }
}

// Idle passives are separate from combat passives. Only the five current party slots count.
const IDLE_PASSIVES = {
  sword: [{ type: 'gold', rate: 0.05 }],
  guardian: [{ type: 'gold', rate: 0.05 }],
  lancer: [{ type: 'progress', rate: 0.05 }],
  archer: [{ type: 'progress', rate: 0.05 }],
  mage: [{ type: 'exp', rate: 0.05 }],
  priest: [{ type: 'exp', rate: 0.05 }],
  rogue: [{ type: 'gold', rate: 0.05 }],
  alchemist: [{ type: 'exp', rate: 0.05 }],
  stargazer: [{ type: 'gold', rate: 0.03 }, { type: 'exp', rate: 0.03 }, { type: 'progress', rate: 0.03 }],
};

/** 汇总当前队伍前五个位置的挂机被动；此处不读取战斗被动。 */
function idleBonusOf(s) {
  const totals = { gold: 0, exp: 0, progress: 0 };
  const details = [];
  (s.party || []).slice(0, 5).forEach((id) => {
    if (!id || !s.cards?.[id]) return;
    const def = getCardDef(s, id);
    if (!def) return;
    const cls = classOf(def.classId);
    const classId = cls.baseId || cls.id;
    if (!cls.baseId && cls.id !== def.classId) return;
    const effects = IDLE_PASSIVES[classId] || [];
    if (!effects.length) return;
    effects.forEach(({ type, rate }) => { totals[type] += rate; });
    details.push({ id, classId, effects: effects.map(({ type, rate }) => ({ type, percent: Math.round(rate * 100) })) });
  });
  return {
    gold: Math.min(0.25, totals.gold),
    exp: Math.min(0.25, totals.exp),
    progress: Math.min(0.25, totals.progress),
    details,
  };
}

// Base idle rates remain unchanged; current party passives are additive.
/** 根据各难度的通关进度确定挂机收益对应的关卡档位。 */
function idleStageOf(s) {
  const progress = s.progress || {};
  let best = { mode: 'normal', stage: 1, tier: 1 };
  MODES.forEach((mode, index) => {
    if (index > 0 && (Number(progress[MODES[index - 1].id]) || 0) < STAGES_PER_MODE) return;
    const cleared = Math.max(0, Math.min(STAGES_PER_MODE, Math.floor(Number(progress[mode.id]) || 0)));
    const stage = cleared >= STAGES_PER_MODE
      ? STAGES_PER_MODE
      : cleared >= 9 ? Math.floor(cleared / 5) * 5 : Math.min(4, cleared + 1);
    const candidate = { mode: mode.id, stage: Math.max(1, stage), tier: index * STAGES_PER_MODE + Math.max(1, stage) };
    if (candidate.tier > best.tier) best = candidate;
  });
  return best;
}

/** 计算基础挂机每小时收益，并叠加当前队伍被动加成。 */
function idleRatesOf(s) {
  const checkpoint = idleStageOf(s);
  const tier = checkpoint.tier;
  const bonus = idleBonusOf(s);
  const baseGold = Math.round(60 * (8 + tier * 1.1));
  const baseExp = Math.round(60 * (5 + tier * 0.8));
  return {
    ...checkpoint,
    bonus,
    goldPerHour: Math.round(baseGold * (1 + bonus.gold)),
    expPerHour: Math.round(baseExp * (1 + bonus.exp)),
    clearsPerHour: 5 * (1 + bonus.progress),
  };
}

/** 将玩家状态和业务 action 注入整个应用树。 */
export function GameProvider({ children }) {
  const [state, setState] = useState(loadState);
  const ref = useRef(state);
  const [toasts, setToasts] = useState([]);
  const [testSupport, setTestSupport] = useState(readTestSupport);
  const toastSeq = useRef(0);

  useEffect(() => {
    persist(state);
  }, [state]);

  // One-time local test grant for both upgraded saves and newly created local saves.
  useEffect(() => {
    if (testSupport) return;
    let marker = null;
    try {
      marker = localStorage.getItem(TEST_SUPPORT_KEY);
    } catch {
      return;
    }
    if (marker) {
      const restored = readTestSupport();
      if (restored) setTestSupport(restored);
      return;
    }
    const claimedAt = Date.now();
    const grantMarker = { claimedAt, expiresAt: claimedAt + TEST_DURATION_MS, ticketsGranted: TEST_TICKETS, gemsGranted: TEST_GEMS };
    const next = { ...ref.current, tickets: (ref.current.tickets || 0) + TEST_TICKETS, gems: (ref.current.gems || 0) + TEST_GEMS };
    try {
      localStorage.setItem(TEST_SUPPORT_KEY, JSON.stringify(grantMarker));
      if (!persist(next)) {
        localStorage.removeItem(TEST_SUPPORT_KEY);
        return;
      }
      ref.current = next;
      setState(next);
      setTestSupport(grantMarker);
    } catch {
      try { localStorage.removeItem(TEST_SUPPORT_KEY); } catch { /* storage unavailable */ }
    }
  }, [testSupport]);

  const t = useCallback((key, vars) => translate(key, ref.current.lang, vars), []);

  const notify = useCallback((msg) => {
    if (!msg) return;
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((prev) => [...prev.slice(-2), { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800);
  }, []);

  // 所有常规状态变更的统一入口：生成新状态、归一化成长/阵型数据，
  // 再同步 ref 与 React state；持久化由上方 state effect 统一负责。
  const commit = useCallback((fn) => traceSync('GameContext.commit', () => {
    const draft = fn({ ...ref.current });
    const next = normalizeCharacterProgressionState({ ...draft, formation: normalizeFormationState(draft.formation, draft.party) });
    ref.current = next;
    setState(next);
    return next;
  }), []);

  const setLang = useCallback(
    (lang) => {
      commit((s) => ({ ...s, lang }));
    },
    [commit],
  );

  const rewardText = useCallback(
    (r) => {
      const lang = ref.current.lang;
      const parts = [];
      if (r.gold) parts.push(`${translate('res.gold', lang)} +${Math.round(r.gold)}`);
      if (r.gems) parts.push(`${translate('res.gems', lang)} +${Math.round(r.gems)}`);
      if (r.tickets) parts.push(`${translate('res.tickets', lang)} +${Math.round(r.tickets)}`);
      if (r.exp) parts.push(`${translate('player.exp', lang)} +${Math.round(r.exp)}`);
      return parts.join(' · ');
    },
    [],
  );

  // grant resources + exp, returns levels gained
  // 将资源与经验应用到传入的草稿状态；此函数不单独 commit，
  // 调用方负责在完成整笔业务结算后统一提交，避免中途状态不一致。
  const grant = (s, r) => {
    if (r.gold) s.gold += Math.round(r.gold);
    if (r.gems) s.gems += Math.round(r.gems);
    if (r.tickets) s.tickets += Math.round(r.tickets);
    if (r.medals) s.medals += Math.round(r.medals);
    let levels = 0;
    if (r.exp) {
      s.exp += Math.round(r.exp);
      const cap = levelCap(s.rebirth || 0);
      while (s.level < cap && s.exp >= expNeed(s.level)) {
        s.exp -= expNeed(s.level);
        s.level += 1;
        levels += 1;
      }
      if (s.level >= cap) s.exp = 0;

      // Character EXP is awarded independently to deployed characters.
      // The player-level EXP system above remains unchanged.
      const characterProgression = grantPartyCharacterExperience(s, r.exp);
      if (characterProgression.state?.characterProgression) {
        s.characterProgression = characterProgression.state.characterProgression;
      }
    }
    return levels;
  };

  // Automatically grant each completed idle hour. Every non-idle gem resource
  // receives its own independent 30% roll for every hour.
  /** 结算已完成的整小时挂机收益；掉落判定委托给 idleRewards 模块。 */
  /** 自动结算已完成的整小时挂机收益；每种挂机资源均独立进行概率判定。 */
  const processIdleAutoRewards = useCallback(() => {
    const current = ref.current;
    const idleState = current.idle || {};
    const storedSeconds = Math.max(0, Number(idleState.elapsedSeconds) || 0);
    const runningSeconds = idleState.active ? Math.max(0, (Date.now() - Number(idleState.at || Date.now())) / 1000) : 0;
    const totalSeconds = storedSeconds + runningSeconds;
    const completedHours = getCompletedIdleHours(totalSeconds);
    if (completedHours < 1) return false;

    const now = Date.now();
    const s = { ...current, enemyShards: { ...(current.enemyShards || {}) } };
    const rates = idleRatesOf(s);
    const drops = rollIdleResourceDrops(completedHours);
    const stageDef = getStage(rates.mode, rates.stage);
    const shardId = stageDef?.enemies?.[0]?.enemyId;
    const clears = Math.max(0, Math.floor(rates.clearsPerHour * completedHours));
    const materialCounts = {};
    if (shardId) {
      for (let i = 0; i < clears; i += 1) {
        materialCounts[shardId] = (materialCounts[shardId] || 0) + 1 + Math.floor(Math.random() * 2);
      }
      Object.entries(materialCounts).forEach(([id, amount]) => {
        s.enemyShards[id] = (s.enemyShards[id] || 0) + amount;
      });
    }

    const levels = grant(s, {
      gold: rates.goldPerHour * completedHours,
      exp: rates.expPerHour * completedHours,
      gems: drops.gems,
      tickets: drops.tickets,
    });
    if (drops.clearGems > 0) {
      s.clearGems = Math.max(0, Number(s.clearGems) || 0) + drops.clearGems;
      s.clearGemStats = {
        earnedFromWins: 0, earnedFromLosses: 0, spent: 0, earnedFromIdle: 0,
        ...(s.clearGemStats || {}),
        earnedFromIdle: (Number(s.clearGemStats?.earnedFromIdle) || 0) + drops.clearGems,
      };
      s.clearGemHistory = [...(s.clearGemHistory || []), {
        at: now, type: 'idle', amount: drops.clearGems, mode: rates.mode, stage: rates.stage,
      }].slice(-30);
    }

    s.idle = {
      ...idleState,
      at: now,
      elapsedSeconds: Math.max(0, Math.floor(totalSeconds - completedHours * 3600)),
    };
    commit(() => s);
    return { hours: completedHours, gold: rates.goldPerHour * completedHours, exp: rates.expPerHour * completedHours, clears, materials: materialCounts, drops, levels };
  }, [commit]);

  const claimCheckin = useCallback(() => {
    const s = { ...ref.current };
    const today = todayKey();
    if (s.checkin.last === today) {
      notify(t('checkin.done'));
      return null;
    }
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    const streak = s.checkin.last === yesterday ? s.checkin.streak + 1 : 1;
    const reward = CHECKIN[(streak - 1) % CHECKIN.length];
    s.checkin = { last: today, streak };
    const levels = grant(s, reward);
    commit(() => s);
    notify(rewardText(reward));
    if (levels) notify(t('notif.levelup', { n: s.level }));
    return reward;
  }, [commit, notify, rewardText, t]);

  const rollFortune = useCallback(() => {
    const s = { ...ref.current };
    const today = todayKey();
    if (s.fortune.date !== today) {
      s.fortune = { date: today, id: FORTUNES[Math.floor(Math.random() * FORTUNES.length)].id };
      commit(() => s);
    }
    return s.fortune;
  }, [commit]);

  const summon = useCallback(
    (count) => {
      const s = {
        ...ref.current,
        cards: { ...ref.current.cards },
        cardCounts: { ...ref.current.cardCounts },
        cardShards: { ...ref.current.cardShards },
      };
      if (s.tickets < count) {
        notify(t('common.notEnough'));
        return null;
      }
      s.tickets -= count;
      const results = [];
      for (let i = 0; i < count; i += 1) {
        const rarity = pickRarity();
        if (rarity === 'SS') s.pity = 0;
        else s.pity += 1;
        if (s.pity >= 10) {
          s.ssTokens += 1;
          s.pity = 0;
        }
        const hero = pickHero(rarity);
        const isNew = !s.cards[hero.id];
        if (isNew) {
          s.cards[hero.id] = true;
          if (s.party.length < 5) s.party = [...s.party, hero.id];
        } else {
          s.cardShards[hero.id] = (s.cardShards[hero.id] || 0) + 2;
          s.cardCounts[hero.id] = (s.cardCounts[hero.id] || 1) + 1;
        }
        results.push({ id: hero.id, rarity, isNew });
      }
      commit(() => s);
      return results;
    },
    [commit, notify, t],
  );

  const exchangeSS = useCallback(
    (heroId) => {
      const s = { ...ref.current, cards: { ...ref.current.cards } };
      if (s.ssTokens < 1) {
        notify(t('common.notEnough'));
        return false;
      }
      s.ssTokens -= 1;
      s.cards[heroId] = true;
      if (s.party.length < 5) s.party = [...s.party, heroId];
      commit(() => s);
      return true;
    },
    [commit, notify, t],
  );

  const setPartySlot = useCallback(
    (index, cardId) => {
      commit((s) => {
        const party = [...s.party];
        while (party.length < 5) party.push(null);
        if (!cardId) {
          party[index] = null;
          return { ...s, party };
        }
        const existing = party.indexOf(cardId);
        if (existing >= 0 && existing !== index) party[existing] = party[index] ?? null;
        party[index] = cardId;
        return { ...s, party };
      });
    },
    [commit],
  );

  const setParty = useCallback(
    (ids) => {
      commit((s) => ({ ...s, party: ids.slice(0, 5) }));
    },
    [commit],
  );

  const setActiveFormation = useCallback((formationId) => {
    commit((s) => {
      const formation = selectActiveFormation(s.formation, formationId, s.party);
      return formation === s.formation ? s : { ...s, formation };
    });
  }, [commit]);

  const setFormationPosition = useCallback((formationId, positionIndex, cardId) => {
    let changed = false;
    commit((s) => {
      const formation = assignFormationPosition(s.formation, formationId, positionIndex, cardId, s.party);
      changed = formation !== s.formation;
      return changed ? { ...s, formation } : s;
    });
    return changed;
  }, [commit]);

  const autoBest = useCallback(() => {
    const s = { ...ref.current };
    s.party = strongestParty(s);
    commit(() => s);
    notify(t('quick.saved'));
  }, [commit, notify, t]);

  const savePreset = useCallback(
    (i) => {
      const s = { ...ref.current };
      const presets = [...s.presets];
      presets[i] = [...s.party];
      s.presets = presets;
      s.presetIndex = i;
      commit(() => s);
      notify(t('quick.saved'));
    },
    [commit, notify, t],
  );

  const loadPreset = useCallback(
    (i) => {
      commit((s) => {
        const p = (s.presets || [])[i] || [];
        if (!p.length) return s;
        return { ...s, party: [...p], presetIndex: i };
      });
    },
    [commit],
  );

  const spendStamina = useCallback(
    (n) => {
      const s = { ...ref.current };
      const now = Date.now();
      const info = currentStamina(s, now);
      if (info.stamina < n) {
        notify(t('common.notEnough'));
        return false;
      }
      s.stamina = info.stamina - n;
      s.staminaAt = info.staminaAt;
      commit(() => s);
      return true;
    },
    [commit, notify, t],
  );

  /** 战斗结束后的统一结算入口：更新进度、奖励、掉落与相关统计。 */
  /** 战斗奖励总入口：分别处理胜负奖励、宝石掉落、碎片与通关进度。 */
  const finishBattle = useCallback(
    ({ mode, n, stage, win }) => {
      const s = {
        ...ref.current,
        codex: { ...ref.current.codex },
        enemyShards: { ...ref.current.enemyShards },
        progress: { ...ref.current.progress },
      };
      if (!win) {
        const idleGemDrop = Math.random() < 0.15 ? 1 : 0;
        if (idleGemDrop) {
          s.idleGems = Math.max(0, Number(s.idleGems) || 0) + idleGemDrop;
          s.idleGemStats = { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, ...(s.idleGemStats || {}) };
          s.idleGemStats.earnedFromLosses += idleGemDrop;
          s.idleGemHistory = [...(s.idleGemHistory || []), { at: Date.now(), type: 'loss', amount: idleGemDrop, mode, stage: n }].slice(-30);
        }
        const clearGemDrop = Math.random() < 0.15 ? 1 : 0;
        if (clearGemDrop) {
          s.clearGems = Math.max(0, Number(s.clearGems) || 0) + clearGemDrop;
          s.clearGemStats = { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, ...(s.clearGemStats || {}) };
          s.clearGemStats.earnedFromLosses += clearGemDrop;
          s.clearGemHistory = [...(s.clearGemHistory || []), { at: Date.now(), type: 'loss', amount: clearGemDrop, mode, stage: n }].slice(-30);
        }
        commit(() => s);
        return { idleGemDrop, idleGems: idleGemDrop, clearGemDrop, clearGems: clearGemDrop };
      }
      const rewards = { gold: stage.gold || 0, exp: stage.exp || 0, gems: stage.gems || 0, medals: 0, shards: 0, shardId: null, levels: 0 };
      const idleGemDrop = Math.random() < 0.30 ? 1 : 0;
      if (idleGemDrop) {
        s.idleGems = Math.max(0, Number(s.idleGems) || 0) + idleGemDrop;
        s.idleGemStats = { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, ...(s.idleGemStats || {}) };
        s.idleGemStats.earnedFromWins += idleGemDrop;
        s.idleGemHistory = [...(s.idleGemHistory || []), { at: Date.now(), type: 'win', amount: idleGemDrop, mode, stage: n }].slice(-30);
      }
      rewards.idleGemDrop = idleGemDrop;
      const clearGemDrop = Math.random() < 0.30 ? 1 : 0;
      if (clearGemDrop) {
        s.clearGems = Math.max(0, Number(s.clearGems) || 0) + clearGemDrop;
        s.clearGemStats = { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, ...(s.clearGemStats || {}) };
        s.clearGemStats.earnedFromWins += clearGemDrop;
        s.clearGemHistory = [...(s.clearGemHistory || []), { at: Date.now(), type: 'win', amount: clearGemDrop, mode, stage: n }].slice(-30);
      }
      rewards.clearGemDrop = clearGemDrop;
      if (mode === 'tower') {
        if (n > s.tower) s.tower = n;
      } else if (mode === 'event') {
        s.eventClears += 1;
        s.medals += stage.medal || 0;
        rewards.medals = stage.medal || 0;
      } else {
        const currentProgress = s.progress[mode] || 0;
        s.progress[mode] = getProgressAfterStageWin(currentProgress, n, Boolean(stage.boss));
      }
      const first = stage.enemies?.[0]?.enemyId;
      if (first) {
        s.codex[first] = (s.codex[first] || 0) + 1;
        const drop = 1 + Math.floor(Math.random() * 2);
        s.enemyShards[first] = (s.enemyShards[first] || 0) + drop;
        rewards.shards = drop;
        rewards.shardId = first;
      }
      rewards.levels = grant(s, rewards);
      commit(() => s);
      return rewards;
    },
    [commit],
  );

  /** 只预览累计挂机时长与可领取收益，不推进计时或写入资源。 */
  const idlePreview = useCallback(() => {
    const s = ref.current;
    const rates = idleRatesOf(s);
    const storedSeconds = Math.max(0, Number(s.idle.elapsedSeconds) || 0);
    const runningSeconds = s.idle.active ? Math.max(0, (Date.now() - s.idle.at) / 1000) : 0;
    const seconds = Math.max(0, Math.floor(storedSeconds + runningSeconds));
    const minutes = Math.floor(seconds / 60);
    return {
      seconds,
      minutes,
      ...rates,
      gold: Math.floor((seconds * rates.goldPerHour) / 3600),
      exp: Math.floor((seconds * rates.expPerHour) / 3600),
      clears: Math.floor((seconds * rates.clearsPerHour) / 3600),
    };
  }, []);

  /** 手动领取挂机收益：计算可领取区间、资源与掉落后统一提交状态。 */
  const claimIdle = useCallback((requestedBatch = 1) => {
    const p = idlePreview();
    if (p.seconds < 1) {
      notify(t('idle.none'));
      return null;
    }
    const s = {
      ...ref.current,
      enemyShards: { ...(ref.current.enemyShards || {}) },
      idleGemStats: { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, ...(ref.current.idleGemStats || {}) },
      idleGemHistory: [...(ref.current.idleGemHistory || [])],
    };
    const owned = Math.max(0, Math.floor(Number(s.idleGems) || 0));
    const requested = [10, 20].includes(requestedBatch) ? requestedBatch : 1;
    const settlements = Math.min(requested, owned);
    if (settlements < 1) {
      notify(t('idle.noGems'));
      return null;
    }
    // One gem represents one settlement of the currently accrued idle interval.
    // Batch settlement repeats the same preview reward N times, without advancing/unlocking stages.
    const now = Date.now();
    const storedSeconds = Math.max(0, Number(s.idle.elapsedSeconds) || 0);
    s.idle = {
      ...s.idle,
      at: s.idle.active ? s.idle.at + Math.max(0, p.seconds - storedSeconds) * 1000 : now,
      elapsedSeconds: s.idle.active ? 0 : Math.max(0, storedSeconds - p.seconds),
    };
    const stageDef = getStage(p.mode, p.stage);
    const shardId = stageDef?.enemies?.[0]?.enemyId;
    const materialCounts = {};
    const clearCount = p.clears * settlements;
    if (shardId && clearCount > 0) {
      for (let i = 0; i < clearCount; i += 1) {
        materialCounts[shardId] = (materialCounts[shardId] || 0) + 1 + Math.floor(Math.random() * 2);
      }
      Object.entries(materialCounts).forEach(([id, amount]) => {
        s.enemyShards[id] = (s.enemyShards[id] || 0) + amount;
      });
    }
    s.idleGems = owned - settlements;
    s.idleGemStats.spent += settlements;
    s.idleGemHistory = [...s.idleGemHistory, { at: now, type: 'spend', amount: -settlements, mode: p.mode, stage: p.stage }].slice(-30);
    const rewards = {
      gold: p.gold * settlements,
      exp: p.exp * settlements,
      clears: clearCount,
      settlements,
      idleGemsSpent: settlements,
      stage: p.stage,
      mode: p.mode,
      materials: Object.entries(materialCounts).map(([id, amount]) => ({ id, name: ENEMY_MAP[id]?.name?.[s.lang] || ENEMY_MAP[id]?.name?.zh || id, amount })),
    };
    rewards.levels = grant(s, rewards);
    commit(() => s);
    return rewards;
  }, [commit, idlePreview, notify, t]);

  /** 消耗通关宝石对已通关关卡执行批量快速结算，并更新对应奖励统计。 */
  const quickClear = useCallback(({ mode, stage: stageN, batch = 10 } = {}) => {
    const s = {
      ...ref.current,
      codex: { ...(ref.current.codex || {}) },
      enemyShards: { ...(ref.current.enemyShards || {}) },
      clearGemStats: { earnedFromWins: 0, earnedFromLosses: 0, spent: 0, ...(ref.current.clearGemStats || {}) },
      clearGemHistory: [...(ref.current.clearGemHistory || [])],
    };
    if (!MODES.some((item) => item.id === mode) || !isStageCleared(s.progress?.[mode], stageN)) {
      notify(t('clearGem.invalidStage'));
      return null;
    }
    const settlements = getClearGemSettlementCount(s.clearGems, batch);
    if (settlements < 1) {
      notify(t('clearGem.noGems'));
      return null;
    }
    const stageDef = getStage(mode, stageN);
    const firstEnemyId = stageDef.enemies?.[0]?.enemyId;
    let materialAmount = 0;
    if (firstEnemyId) {
      for (let index = 0; index < settlements; index += 1) materialAmount += 1 + Math.floor(Math.random() * 2);
      s.codex[firstEnemyId] = (s.codex[firstEnemyId] || 0) + settlements;
      s.enemyShards[firstEnemyId] = (s.enemyShards[firstEnemyId] || 0) + materialAmount;
    }
    const now = Date.now();
    s.clearGems = Math.max(0, Math.floor(Number(s.clearGems) || 0)) - settlements;
    s.clearGemStats.spent += settlements;
    s.clearGemHistory = [...s.clearGemHistory, { at: now, type: 'spend', amount: -settlements, mode, stage: stageN }].slice(-30);
    const rewards = {
      mode, stage: stageN, clears: settlements, settlements, clearGemsSpent: settlements,
      gold: (stageDef.gold || 0) * settlements,
      exp: (stageDef.exp || 0) * settlements,
      gems: (stageDef.gems || 0) * settlements,
      materials: firstEnemyId && materialAmount > 0
        ? [{ id: firstEnemyId, name: ENEMY_MAP[firstEnemyId]?.name?.[s.lang] || ENEMY_MAP[firstEnemyId]?.name?.zh || firstEnemyId, amount: materialAmount }]
        : [],
    };
    rewards.levels = grant(s, rewards);
    commit(() => s);
    return rewards;
  }, [commit, notify, t]);

  /** 开始/暂停挂机计时；切换前先结算已经完成的整小时自动收益。 */
  const toggleIdle = useCallback(() => {
    processIdleAutoRewards();
    const now = Date.now();
    commit((s) => {
      const storedSeconds = Math.max(0, Number(s.idle.elapsedSeconds) || 0);
      if (s.idle.active) {
        const elapsed = Math.floor(storedSeconds + Math.max(0, (now - s.idle.at) / 1000));
        return { ...s, idle: { active: false, at: now, elapsedSeconds: elapsed } };
      }
      return { ...s, idle: { active: true, at: now, elapsedSeconds: storedSeconds } };
    });
  }, [commit, processIdleAutoRewards]);

  const refreshBounties = useCallback(() => {
    const slot = bountySlot();
    if (ref.current.bounties.slot !== slot) {
      commit((s) => ({ ...s, bounties: { slot, list: generateBounties(slot) } }));
    }
  }, [commit]);

  const dispatchBounty = useCallback(
    (id) => {
      const s = {
        ...ref.current,
        bounties: { ...ref.current.bounties, list: ref.current.bounties.list.map((b) => ({ ...b })) },
      };
      const b = s.bounties.list.find((x) => x.id === id);
      if (!b || b.cardId) return;
      const tpl = BOUNTY_MAP[b.tplId];
      const owned = Object.keys(s.cards).filter((cid) => getCardDef(s, cid)?.classId === tpl.classId);
      if (!owned.length) {
        notify(t('tavern.noCard'));
        return;
      }
      const cardId = owned[0];
      b.cardId = cardId;
      b.startedAt = Date.now();
      b.endsAt = Date.now() + tpl.minutes * 60000;
      commit(() => s);
      notify(getCardDef(s, cardId)?.name?.[s.lang] || '');
    },
    [commit, notify, t],
  );

  const claimBounty = useCallback(
    (id) => {
      const s = {
        ...ref.current,
        cardShards: { ...ref.current.cardShards },
        bounties: { ...ref.current.bounties, list: ref.current.bounties.list.map((b) => ({ ...b })) },
      };
      const b = s.bounties.list.find((x) => x.id === id);
      if (!b || !b.endsAt || Date.now() < b.endsAt) return null;
      const tpl = BOUNTY_MAP[b.tplId];
      const pool = HEROES.filter((h) => h.classId === tpl.classId);
      const hero = pool[Math.floor(Math.random() * pool.length)];
      s.cardShards[hero.id] = (s.cardShards[hero.id] || 0) + tpl.rewards.shards;
      const rewards = { ...tpl.rewards };
      rewards.exp = tpl.rewards.exp;
      rewards.levels = grant(s, rewards);
      s.bounties.list = s.bounties.list.filter((x) => x.id !== id);
      commit(() => s);
      return { ...rewards, heroId: hero.id };
    },
    [commit],
  );

  const synthesize = useCallback(
    (heroId) => {
      const s = { ...ref.current, cards: { ...ref.current.cards }, cardShards: { ...ref.current.cardShards } };
      const have = s.cardShards[heroId] || 0;
      if (have < 5 || s.cards[heroId]) return false;
      s.cardShards[heroId] = have - 5;
      s.cards[heroId] = true;
      if (s.party.length < 5) s.party = [...s.party, heroId];
      commit(() => s);
      return true;
    },
    [commit],
  );

  const breakthroughHero = useCallback(
    (cardId) => {
      const result = breakthroughCharacter(ref.current, cardId);
      if (!result.success) {
        const messages = {
          'missing-character': t('common.notEnough'),
          'level-cap-not-reached': t('progression.breakthroughNeedMax'),
          'insufficient-materials': t('progression.breakthroughNeedMaterials'),
        };
        notify(messages[result.reason] || t('common.notEnough'));
        return result;
      }
      commit(() => result.state);
      notify(t('progression.breakthroughSuccess'));
      return result;
    },
    [commit, notify, t],
  );

  // same-type fusion: 3 × A → 1 × S, 3 × S → 1 × SS
  const fuseCards = useCallback(
    (cardId) => {
      const base = ref.current;
      const def = getCardDef(base, cardId);
      const next = def ? RARITY_NEXT[def.rarity] : null;
      if (!def || !next || copiesOf(base, cardId) < 3) {
        notify(t('common.notEnough'));
        return null;
      }
      const upId = upgradedId(cardId, next);
      const s = {
        ...base,
        cards: { ...base.cards },
        cardCounts: { ...base.cardCounts },
        customDefs: { ...base.customDefs },
      };
      if (!s.customDefs[upId]) {
        s.customDefs[upId] = {
          id: upId,
          name: upgradedName(def.name),
          classId: def.classId,
          gender: def.gender,
          rarity: next,
          stats: classStats(def.classId, next),
        };
      }
      // Preserve the strongest complete growth record across consumed materials and existing result copies.
      Object.assign(s, fuseCharacterProgressionInstances(s, cardId, upId, 3));
      const left = copiesOf(base, cardId) - 3;
      if (left > 0) {
        s.cardCounts[cardId] = left;
      } else {
        delete s.cardCounts[cardId];
        delete s.cards[cardId];
        s.party = (s.party || []).map((pid) => (pid === cardId ? null : pid));
      }
      s.cards[upId] = true;
      s.cardCounts[upId] = (s.cardCounts[upId] || 0) + 1;
      if (s.party.length < 5) s.party = [...s.party, upId];
      commit(() => s);
      notify(s.customDefs[upId].name[base.lang] || s.customDefs[upId].name.zh);
      return upId;
    },
    [commit, notify, t],
  );

  const convertEnemy = useCallback(
    (enemyId) => {
      const s = {
        ...ref.current,
        cards: { ...ref.current.cards },
        enemyShards: { ...ref.current.enemyShards },
        customDefs: { ...ref.current.customDefs },
      };
      const have = s.enemyShards[enemyId] || 0;
      if (have < 5) return false;
      const enemy = ENEMY_MAP[enemyId];
      if (!enemy) return false;
      const classId = convertClassFor(enemy.type);
      const id = `conv_${enemyId}`;
      s.enemyShards[enemyId] = have - 5;
      if (!s.customDefs[id]) {
        s.customDefs[id] = {
          id,
          name: {
            zh: `转化·${enemy.name.zh}`,
            ja: `転化・${enemy.name.ja}`,
            en: `Converted ${enemy.name.en}`,
          },
          classId,
          gender: 'none',
          rarity: enemy.rarity,
          converted: true,
          stats: classStats(classId, enemy.rarity),
        };
      }
      s.cards[id] = true;
      if (s.party.length < 5) s.party = [...s.party, id];
      commit(() => s);
      return true;
    },
    [commit],
  );

  const rebirth = useCallback(
    (ascendId) => {
      const s = { ...ref.current };
      if (s.level < levelCap(s.rebirth || 0)) {
        notify(t('synth.locked'));
        return false;
      }
      s.level = 1;
      s.exp = 0;
      s.rebirth = (s.rebirth || 0) + 1;
      s.classId = ascendId || classOf(s.classId).id;
      commit(() => s);
      notify(t('common.confirm'));
      return true;
    },
    [commit, notify, t],
  );

  const craftRelic = useCallback(
    (relicId) => {
      const relic = RELICS.find((r) => r.id === relicId);
      const s = { ...ref.current, relics: { ...ref.current.relics } };
      if (!relic || s.gems < relic.cost) {
        notify(t('common.notEnough'));
        return false;
      }
      s.gems -= relic.cost;
      s.relics[relicId] = (s.relics[relicId] || 0) + 1;
      commit(() => s);
      return true;
    },
    [commit, notify, t],
  );

  const equipEquipment = useCallback(
    (cardId, slot, itemId) => {
      const previousItemId = getEquippedItem(ref.current, cardId, slot);
      const result = equipItem(ref.current, cardId, slot, itemId);
      if (!result.ok) {
        notify(result.reason === 'already_equipped' ? t('equipment.alreadyEquipped') : t('common.notEnough'));
        logWarn('Equipment', 'equipItem', { cardId, slot, itemId, reason: result.reason });
        return false;
      }
      if (!persist(result.state)) {
        notify(ref.current.lang === 'ja' ? '保存に失敗しました。装備は変更されていません。' : ref.current.lang === 'en' ? 'Save failed. Equipment was not changed.' : '保存失败，装备状态未更改。');
        logWarn('Equipment', 'equipItem', { cardId, slot, itemId, reason: 'save_failed' });
        return false;
      }
      logInfo('Equipment', itemId ? 'equipItem' : 'unequipItem', { cardId, slot, previousItemId, itemId, itemName: getEquipmentDefinition(slot, itemId || previousItemId)?.name || null });
      commit(() => result.state);
      return true;
    },
    [commit, notify, t],
  );

  const equipRelic = useCallback(
    (cardId, relicId) => equipEquipment(cardId, 'relic', relicId),
    [equipEquipment],
  );

  const meltShards = useCallback(
    (heroId) => {
      const s = { ...ref.current, cardShards: { ...ref.current.cardShards } };
      const have = s.cardShards[heroId] || 0;
      if (have < 5) return false;
      s.cardShards[heroId] = have - 5;
      s.gems += 150;
      commit(() => s);
      notify(`${t('res.gems')} +150`);
      return true;
    },
    [commit, notify, t],
  );

  const buyShop = useCallback(
    (itemId) => {
      const s = { ...ref.current };
      if (itemId === 'stamina') {
        if (s.gems < 100) {
          notify(t('common.notEnough'));
          return false;
        }
        const info = currentStamina(s);
        if (info.stamina >= STAMINA_MAX) {
          notify(t('common.full'));
          return false;
        }
        s.gems -= 100;
        s.stamina = Math.min(STAMINA_MAX, info.stamina + 20);
        s.staminaAt = info.staminaAt;
        commit(() => s);
        return true;
      }
      if (itemId === 'ticket') {
        if (s.gems < 80) {
          notify(t('common.notEnough'));
          return false;
        }
        s.gems -= 80;
        s.tickets += 1;
        commit(() => s);
        return true;
      }
      return false;
    },
    [commit, notify, t],
  );

  const claimMilestone = useCallback(
    (kind, at) => {
      const s = { ...ref.current, msClaimed: { ...ref.current.msClaimed } };
      const ms = MILESTONES.find((m) => m.at === at);
      if (!ms) return false;
      const claimed = s.msClaimed[kind] || [];
      if (claimed.includes(at)) return false;
      const count =
        kind === 'heroes'
          ? HEROES.filter((h) => s.cards[h.id]).length
          : Object.keys(s.codex || {}).length;
      if (count < at) return false;
      s.msClaimed[kind] = [...claimed, at];
      s.gems += ms.gems;
      commit(() => s);
      notify(rewardText({ gems: ms.gems }));
      return true;
    },
    [commit, notify, rewardText],
  );

  const exchangeMedals = useCallback(() => {
    const s = { ...ref.current, cards: { ...ref.current.cards }, cardShards: { ...ref.current.cardShards } };
    if (s.medals < 40) {
      notify(t('common.notEnough'));
      return false;
    }
    s.medals -= 40;
    const pool = HEROES.filter((h) => h.rarity === 'SS');
    const hero = pool[Math.floor(Math.random() * pool.length)];
    if (!s.cards[hero.id]) {
      s.cards[hero.id] = true;
      if (s.party.length < 5) s.party = [...s.party, hero.id];
    } else {
      s.cardShards[hero.id] = (s.cardShards[hero.id] || 0) + 2;
    }
    commit(() => s);
    notify(hero.name[ref.current.lang] || hero.name.zh);
    return true;
  }, [commit, notify, t]);


  const exchangeResources = useCallback((fromKey, toKey, amount) => {
    const result = applyResourceExchange(ref.current, fromKey, toKey, amount);
    if (!result.success) {
      const message = result.reason === 'insufficient-balance' ? t('resourceExchange.insufficient') : result.reason === 'same-resource' ? t('resourceExchange.sameResource') : t('resourceExchange.invalid');
      notify(message);
      return false;
    }
    if (!persist(result.state)) {
      notify(t('resourceExchange.saveFailed'));
      return false;
    }
    commit(() => result.state);
    const label = (key) => t(key === 'idleGems' ? 'res.idleGems' : key === 'clearGems' ? 'res.clearGems' : 'res.' + key);
    notify(t('resourceExchange.success', { spent: result.spent, from: label(fromKey), received: result.received, to: label(toKey) }));
    return true;
  }, [commit, notify, t]);

  const refillTestStamina = useCallback(() => {
    const support = readTestSupport();
    if (!support || Date.now() >= support.expiresAt) {
      notify(t('testSupport.expired'));
      return false;
    }
    const s = { ...ref.current };
    const info = currentStamina(s);
    if (info.stamina >= STAMINA_MAX) {
      notify(t('common.full'));
      return false;
    }
    s.stamina = STAMINA_MAX;
    s.staminaAt = Date.now();
    commit(() => s);
    notify(t('testSupport.refilled'));
    return true;
  }, [commit, notify, t]);

  const exportSave = useCallback(() => exportSaveData(ref.current, APP_VERSION), []);
  const inspectSave = useCallback((raw) => inspectSaveData(raw), []);
  const restoreSave = useCallback((raw) => {
    const result = restoreSaveData(raw);

    // A failed restore must not touch ref.current or React state. The save layer
    // has already protected localStorage; this layer only publishes success.
    if (!result.success) {
      const messageKey = {
        'progress-not-higher': 'save.progressNotHigher',
        'current-save-invalid': 'save.currentSaveInvalid',
        'current-save-read-failed': 'save.currentSaveReadFailed',
        'storage-write-failed': 'save.storageFailed',
      }[result.reason] || 'save.importFailed';
      notify(t(messageKey));
      return result;
    }

    ref.current = result.state;
    setState(result.state);
    notify(t('save.importSuccess'));
    return result;
  }, [notify, t]);

  const resetSave = useCallback(() => {
    const fresh = resetState();
    // Persist first: if storage fails, keep the existing in-memory and on-disk save intact.
    if (!replaceSave(fresh)) {
      notify(ref.current.lang === 'ja' ? 'リセットの保存に失敗しました。既存データは変更されていません。' : ref.current.lang === 'en' ? 'Reset could not be saved. Existing data was not changed.' : '重置保存失败，原有数据未更改。');
      return false;
    }
    ref.current = fresh;
    setState(fresh);
    return true;
  }, [notify]);

  useEffect(() => {
    processIdleAutoRewards();
    const timer = setInterval(() => {
      processIdleAutoRewards();
      refreshBounties();
      const s = ref.current;
      const info = currentStamina(s);
      if (info.stamina !== s.stamina) commit((prev) => ({ ...prev, ...info }));
      else setState((prev) => ({ ...prev }));
    }, 20000);
    return () => clearInterval(timer);
  }, [commit, processIdleAutoRewards, refreshBounties]);

  const fortuneDef =
    state.fortune.date === todayKey()
      ? FORTUNES.find((f) => f.id === state.fortune.id) || null
      : null;

  const value = useMemo(() => {
    const info = currentStamina(state);
    const testSupportActive = Boolean(testSupport && Date.now() < testSupport.expiresAt);
    const ownedHeroes = Object.keys(state.cards).filter((id) => getCardDef(state, id));
    return {
      ...state,
      stamina: info.stamina,
      staminaAt: info.staminaAt,
      staminaMax: STAMINA_MAX,
      testSupport: testSupport ? { ...testSupport, active: testSupportActive, daysRemaining: Math.max(0, Math.ceil((testSupport.expiresAt - Date.now()) / 86400000)) } : null,
      t,
      notify,
      setLang,
      fortuneDef,
      power: partyPower(state),
      totals: teamTotals(state),
      ownedHeroes,
      ownedHeroCount: HEROES.filter((h) => state.cards[h.id]).length,
      enemyUnlocked: Object.keys(state.codex || {}).length,
      cleared: Object.values(state.progress || {}).reduce((a, b) => a + b, 0),
      totalStages: MODES.length * STAGES_PER_MODE,
      defOf: (id) => getCardDef(state, id),
      powerOf: (id) => cardPower(state, id),
      actions: {
        claimCheckin: traceAction('claimCheckin', claimCheckin),
        rollFortune: traceAction('rollFortune', rollFortune),
        summon: traceAction('summon', summon),
        exchangeSS: traceAction('exchangeSS', exchangeSS),
        setPartySlot: traceAction('setPartySlot', setPartySlot),
        setParty: traceAction('setParty', setParty),
        setActiveFormation: traceAction('setActiveFormation', setActiveFormation),
        setFormationPosition: traceAction('setFormationPosition', setFormationPosition),
        autoBest: traceAction('autoBest', autoBest),
        savePreset: traceAction('savePreset', savePreset),
        loadPreset: traceAction('loadPreset', loadPreset),
        spendStamina: traceAction('spendStamina', spendStamina),
        finishBattle: traceAction('finishBattle', finishBattle),
        idlePreview: traceAction('idlePreview', idlePreview),
        claimIdle: traceAction('claimIdle', claimIdle),
        quickClear: traceAction('quickClear', quickClear),
        toggleIdle: traceAction('toggleIdle', toggleIdle),
        refreshBounties: traceAction('refreshBounties', refreshBounties),
        dispatchBounty: traceAction('dispatchBounty', dispatchBounty),
        claimBounty: traceAction('claimBounty', claimBounty),
        synthesize: traceAction('synthesize', synthesize),
        breakthroughHero: traceAction('breakthroughHero', breakthroughHero),
        fuseCards: traceAction('fuseCards', fuseCards),
        convertEnemy: traceAction('convertEnemy', convertEnemy),
        rebirth: traceAction('rebirth', rebirth),
        craftRelic: traceAction('craftRelic', craftRelic),
        equipRelic: traceAction('equipRelic', equipRelic),
        equipEquipment: traceAction('equipEquipment', equipEquipment),
        meltShards: traceAction('meltShards', meltShards),
        buyShop: traceAction('buyShop', buyShop),
        refillTestStamina: traceAction('refillTestStamina', refillTestStamina),
        exchangeMedals: traceAction('exchangeMedals', exchangeMedals),
        exchangeResources: traceAction('exchangeResources', exchangeResources),
        claimMilestone: traceAction('claimMilestone', claimMilestone),
        resetSave: traceAction('resetSave', resetSave),
        exportSave: traceAction('exportSave', exportSave),
        inspectSave: traceAction('inspectSave', inspectSave),
        restoreSave: traceAction('restoreSave', restoreSave),
      },
    };
  }, [
    state,
    testSupport,
    t,
    notify,
    setLang,
    fortuneDef,
    claimCheckin,
    rollFortune,
    summon,
    exchangeSS,
    setPartySlot,
    setParty,
    setActiveFormation,
    setFormationPosition,
    autoBest,
    savePreset,
    loadPreset,
    spendStamina,
    finishBattle,
    idlePreview,
    claimIdle,
    toggleIdle,
    refreshBounties,
    dispatchBounty,
    claimBounty,
    synthesize,
    breakthroughHero,
    fuseCards,
    convertEnemy,
    rebirth,
    craftRelic,
    equipRelic,
    equipEquipment,
    meltShards,
    buyShop,
    refillTestStamina,
    exchangeMedals,
    exchangeResources,
    claimMilestone,
    resetSave,
    exportSave,
    inspectSave,
    restoreSave,
  ]);

  return (
    <GameCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-1.5 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rise-in rounded-full border border-primary/30 bg-[#0b0e1c]/92 px-4 py-1.5 text-[11px] tracking-wider text-primary shadow-[0_10px_30px_-12px_rgba(232,200,122,0.6)] backdrop-blur-md"
          >
            {toast.msg}
          </div>
        ))}
      </div>
    </GameCtx.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}