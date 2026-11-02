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
} from './gameData';
import {
  STAMINA_MAX,
  bountySlot,
  clearSave,
  currentStamina,
  defaultState,
  generateBounties,
  highestTier,
  loadState,
  nextStageTarget,
  persist,
  todayKey,
} from './save';
import { cardPower, copiesOf, getCardDef, partyPower, strongestParty, teamTotals } from './cards';

const GameCtx = createContext(null);

const IDLE_CAP_MIN = 720;

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

// 挂机效率随最高关卡层级提升，统一以「每小时」为单位计算
function idleRatesOf(s) {
  const tier = highestTier(s);
  return {
    tier,
    goldPerHour: Math.round(60 * (8 + tier * 1.1)),
    expPerHour: Math.round(60 * (5 + tier * 0.8)),
    clearsPerHour: 5,
  };
}

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState);
  const ref = useRef(state);
  const [toasts, setToasts] = useState([]);
  const [testSupport, setTestSupport] = useState(readTestSupport);
  const toastSeq = useRef(0);

  useEffect(() => {
    persist(state);
  }, [state]);

  const t = useCallback((key, vars) => translate(key, ref.current.lang, vars), []);

  const notify = useCallback((msg) => {
    if (!msg) return;
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((prev) => [...prev.slice(-2), { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800);
  }, []);

  const commit = useCallback((fn) => {
    const next = fn({ ...ref.current });
    ref.current = next;
    setState(next);
    return next;
  }, []);

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
    }
    return levels;
  };

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

  const finishBattle = useCallback(
    ({ mode, n, stage, win }) => {
      const s = {
        ...ref.current,
        codex: { ...ref.current.codex },
        enemyShards: { ...ref.current.enemyShards },
        progress: { ...ref.current.progress },
      };
      if (!win) {
        commit(() => s);
        return null;
      }
      const rewards = { gold: stage.gold || 0, exp: stage.exp || 0, gems: stage.gems || 0, medals: 0, shards: 0, shardId: null, levels: 0 };
      if (mode === 'tower') {
        if (n > s.tower) s.tower = n;
      } else if (mode === 'event') {
        s.eventClears += 1;
        s.medals += stage.medal || 0;
        rewards.medals = stage.medal || 0;
      } else if ((s.progress[mode] || 0) === n - 1) {
        s.progress[mode] = n;
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

  const idlePreview = useCallback(() => {
    const s = ref.current;
    const rates = idleRatesOf(s);
    const elapsed = s.idle.active ? Math.max(0, (Date.now() - s.idle.at) / 1000) : 0;
    const seconds = Math.min(IDLE_CAP_MIN * 60, Math.floor(elapsed));
    const minutes = Math.floor(seconds / 60);
    return {
      seconds,
      minutes,
      ...rates,
      gold: Math.floor((seconds * rates.goldPerHour) / 3600),
      exp: Math.floor((seconds * rates.expPerHour) / 3600),
      clears: Math.min(8, Math.floor(minutes / 12)),
    };
  }, []);

  const claimIdle = useCallback(() => {
    const p = idlePreview();
    if (p.minutes < 5) {
      notify(t('idle.none'));
      return null;
    }
    const s = { ...ref.current, progress: { ...ref.current.progress } };
    // 按整秒结算：未满一秒的余数保留；触及 12 小时上限则从此刻重新计时，避免重复补发
    s.idle = {
      ...s.idle,
      at: p.seconds >= IDLE_CAP_MIN * 60 ? Date.now() : s.idle.at + p.seconds * 1000,
    };
    let clears = p.clears;
    while (clears > 0) {
      const target = nextStageTarget(s);
      if (!target) break;
      s.progress[target.mode] = target.n;
      clears -= 1;
    }
    const rewards = { gold: p.gold, exp: p.exp, clears: p.clears - clears };
    rewards.levels = grant(s, rewards);
    commit(() => s);
    return rewards;
  }, [commit, idlePreview, notify, t]);

  const toggleIdle = useCallback(() => {
    commit((s) => ({
      ...s,
      idle: { active: !s.idle.active, at: Date.now() },
    }));
  }, [commit]);

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

  const equipRelic = useCallback(
    (cardId, relicId) => {
      commit((s) => {
        const equipped = { ...s.equipped };
        if (relicId) equipped[cardId] = relicId;
        else delete equipped[cardId];
        return { ...s, equipped };
      });
    },
    [commit],
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

  const resetSave = useCallback(() => {
    clearSave();
    const fresh = defaultState();
    ref.current = fresh;
    setState(fresh);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshBounties();
      const s = ref.current;
      const info = currentStamina(s);
      if (info.stamina !== s.stamina) commit((prev) => ({ ...prev, ...info }));
      else setState((prev) => ({ ...prev }));
    }, 20000);
    return () => clearInterval(timer);
  }, [commit, refreshBounties]);

  const fortuneDef =
    state.fortune.date === todayKey()
      ? FORTUNES.find((f) => f.id === state.fortune.id) || null
      : null;

  const value = useMemo(() => {
    const info = currentStamina(state);
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
        claimCheckin,
        rollFortune,
        summon,
        exchangeSS,
        setPartySlot,
        setParty,
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
        fuseCards,
        convertEnemy,
        rebirth,
        craftRelic,
        equipRelic,
        meltShards,
        buyShop,
        exchangeMedals,
        claimMilestone,
        resetSave,
      },
    };
  }, [
    state,
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
    fuseCards,
    convertEnemy,
    rebirth,
    craftRelic,
    equipRelic,
    meltShards,
    buyShop,
    exchangeMedals,
    claimMilestone,
    resetSave,
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