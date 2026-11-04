import { HEROES, RELICS, classOf, heroStats } from './gameData.js';
import { getEquippedItem, getEquipmentBonuses, getEquipmentEffects } from './equipment.js';
import { characterGrowthMultipliers, strongestCharacterInstance, characterClassIdFor, getCharacterBreakthroughBonuses } from './characterProgression.js';

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

// The main character's player level grants one separate teamwide bonus.
// It is applied only when building battle units, never inside cardStats,
// so the same bonus cannot be multiplied repeatedly by UI/stat callers.
export function mainCharacterTeamBonusMultiplier(state) {
  const mainLevel = Math.max(1, Math.floor(Number(state?.level) || 1));
  return 1 + (mainLevel - 1) * 0.03;
}

export function relicOf(state, id) {
  const rid = getEquippedItem(state, id, 'relic');
  return RELICS.find((r) => r.id === rid) || null;
}

export function cardStats(state, id) {
  const def = getCardDef(state, id);
  if (!def) return null;
  const lm = levelMult(state);
  const equipment = getEquipmentBonuses(state, id);
  const base = def.stats;
  const progression = strongestCharacterInstance(state, id)?.[1];
  const career = characterGrowthMultipliers(def.classId, progression?.level || 1);
  const breakthrough = getCharacterBreakthroughBonuses(progression, characterClassIdFor(state, id) || def.classId);
  return {
    hp: Math.round(base.hp * career.hp * lm * (1 + equipment.hpPct)) + breakthrough.hp,
    atk: Math.round(base.atk * career.atk * lm * (1 + equipment.atkPct)) + breakthrough.atk,
    def: Math.round(base.def * career.def * lm * (1 + equipment.defPct)) + breakthrough.def,
    spd: Math.round(base.spd * (1 + equipment.spdPct)),
    mp: Math.round((base.mp || 100) * career.mp) + breakthrough.mp,
    crit: Math.min(0.75, (base.crit || 0.08) + equipment.crit),
    critDamagePct: equipment.critDamagePct,
    damageDealtPct: equipment.damageDealtPct,
    damageReductionPct: equipment.damageReductionPct,
    healBonus: equipment.healPct,
    mpCostReductionPct: equipment.mpCostReductionPct,
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
  return partyUnits(state).reduce(
    (acc, unit) => {
      acc.hp += unit.maxHp;
      acc.mp += unit.maxMp;
      acc.lp += unit.maxLp;
      return acc;
    },
    { hp: 0, mp: 0, lp: 0 },
  );
}

export function partyUnits(state, fortune = null) {
  const f = fortune?.effect || {};
  const teamBonus = mainCharacterTeamBonusMultiplier(state);
  return (state.party || [])
    .map((id) => {
      const def = getCardDef(state, id);
      const st = cardStats(state, id);
      if (!def || !st) return null;
      const hp = Math.round(st.hp * teamBonus * (1 + (f.hp || 0)));
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
        atk: Math.round(st.atk * teamBonus * (1 + (f.atk || 0))),
        def: Math.round(st.def * teamBonus * (1 + (f.def || 0))),
        spd: Math.round(st.spd * (1 + (f.spd || 0))),
        crit: Math.min(0.75, st.crit + (f.crit || 0)),
        critDamagePct: st.critDamagePct,
        damageDealtPct: st.damageDealtPct,
        damageReductionPct: st.damageReductionPct,
        mp: Math.round(st.mp * teamBonus),
        maxMp: Math.round(st.mp * teamBonus),
        lp: 6,
        maxLp: 6,
        healBonus: st.healBonus + (f.heal || 0),
        equipmentEffects: getEquipmentEffects(state, id),
        mpCostReductionPct: st.mpCostReductionPct,
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