import { HEROES, RELICS, classOf, heroStats } from './gameData';
import { getEquippedItem } from './equipment';

export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function getCardDef(state, id) {
  if (!id) return null;
  const h = HERO_MAP[id];
  if (h) return { ...h, stats: heroStats(h), skills: classOf(h.classId).skills };
  const custom = state?.customDefs?.[id];
  if (custom) return { ...custom, skills: classOf(custom.classId).skills };
  return null;
}

export function copiesOf(state, id) {
  const n = state?.cardCounts?.[id];
  if (typeof n === 'number') return n;
  return state?.cards?.[id] ? 1 : 0;
}

export function levelMult(state) {
  return 1 + (state.level - 1) * 0.022 + (state.rebirth || 0) * 0.35;
}

export function relicOf(state, id) {
  const rid = getEquippedItem(state, id, 'relic');
  return RELICS.find((r) => r.id === rid) || null;
}

export function cardStats(state, id) {
  const def = getCardDef(state, id);
  if (!def) return null;
  const lm = levelMult(state);
  const relic = relicOf(state, id);
  const base = def.stats;
  return {
    hp: Math.round(base.hp * lm * (1 + (relic?.hp || 0))),
    atk: Math.round(base.atk * lm * (1 + (relic?.atk || 0))),
    def: Math.round(base.def * lm * (1 + (relic?.def || 0))),
    spd: Math.round(base.spd * (1 + (relic?.spd || 0))),
    mp: base.mp || 100,
    crit: base.crit || 0.08,
  };
}

export function cardPower(state, id) {
  const st = cardStats(state, id);
  if (!st) return 0;
  return Math.round(st.hp * 0.3 + st.atk * 5 + st.def * 2.5 + st.spd * 2);
}

export function partyPower(state) {
  return (state.party || []).reduce((sum, id) => sum + cardPower(state, id), 0);
}

export function teamTotals(state) {
  return (state.party || []).reduce(
    (acc, id) => {
      const st = cardStats(state, id);
      if (!st) return acc;
      acc.hp += st.hp;
      acc.mp += st.mp;
      acc.lp += 6;
      return acc;
    },
    { hp: 0, mp: 0, lp: 0 },
  );
}

export function partyUnits(state, fortune = null) {
  const f = fortune?.effect || {};
  return (state.party || [])
    .map((id) => {
      const def = getCardDef(state, id);
      const st = cardStats(state, id);
      if (!def || !st) return null;
      const hp = Math.round(st.hp * (1 + (f.hp || 0)));
      return {
        uid: `a_${id}`,
        cardId: id,
        side: 'ally',
        name: def.name[state.lang] || def.name.zh,
        classId: def.classId,
        rarity: def.rarity,
        gender: def.gender,
        hp,
        maxHp: hp,
        atk: Math.round(st.atk * (1 + (f.atk || 0))),
        def: Math.round(st.def * (1 + (f.def || 0))),
        spd: Math.round(st.spd * (1 + (f.spd || 0))),
        crit: st.crit + (f.crit || 0),
        mp: st.mp,
        maxMp: st.mp,
        lp: 6,
        maxLp: 6,
        healBonus: f.heal || 0,
        skills: def.skills,
      };
    })
    .filter(Boolean);
}

export function strongestParty(state) {
  const ids = Object.keys(state.cards || {}).filter((id) => getCardDef(state, id));
  return ids
    .map((id) => ({ id, power: cardPower(state, id) }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 5)
    .map((x) => x.id);
}