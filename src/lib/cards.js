/**
 * 角色卡牌与战斗单位组装层。
 *
 * 本模块连接静态 HERO 定义、角色成长、装备、幸运效果与阵型系统。
 * cardStats 计算角色个人面板属性；partyUnits 将当前队伍转换成 battle.js
 * 可直接使用的运行单位，并在这里汇总玩家等级团队加成和阵型加成。
 *
 * 重要边界：
 * - cardStats 不叠加玩家等级的团队加成；该加成只在 partyUnits 组装战斗单位时应用。
 * - partyPower 是展示/比较用途的战力估算，不等同于完整战斗模拟结果。
 * - partyUnits 中的 formationBonus / formationEffects 是战斗侧消费的数据契约。
 * 修改属性来源时应检查是否重复叠加，尤其是成长、装备、幸运和阵型效果。
 */
import { HEROES, RELICS, classOf, heroStats } from './gameData.js';
import { getEquippedItem, getEquipmentBonuses, getEquipmentEffects } from './equipment.js';
import { characterGrowthMultipliers, strongestCharacterInstance, characterClassIdFor, getCharacterBreakthroughBonuses } from './characterProgression.js';
import { getDesperateCombatRates } from './desperateCombat.js';
import { getFormationCombatBonuses, getFormationEffectBonuses, getFormationStatBonuses } from './formationSystem.js';

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

/** 计算单个角色面板属性：基础属性 × 角色成长 × 玩家等级成长 × 装备，再叠加突破固定值。 */
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


export function characterStatBreakdown(state, id) {
  const def = getCardDef(state, id);
  if (!def) return null;
  const progression = strongestCharacterInstance(state, id)?.[1] || null;
  const career = characterGrowthMultipliers(def.classId, progression?.level || 1);
  const equipment = getEquipmentBonuses(state, id);
  const breakthrough = getCharacterBreakthroughBonuses(
    progression,
    characterClassIdFor(state, id) || def.classId,
  );
  return {
    mainCharacterLevel: Math.max(1, Math.floor(Number(state?.level) || 1)),
    teamBonusPercent: Math.round((mainCharacterTeamBonusMultiplier(state) - 1) * 10000) / 100,
    characterLevel: progression?.level || 1,
    careerGrowthPercent: Object.fromEntries(
      Object.entries(career).map(([stat, multiplier]) => [stat, Math.round((multiplier - 1) * 10000) / 100]),
    ),
    breakthrough,
    equipment: {
      hpPct: equipment.hpPct,
      atkPct: equipment.atkPct,
      defPct: equipment.defPct,
      spdPct: equipment.spdPct,
      crit: equipment.crit,
    },
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

/** 将当前上阵名单组装为战斗单位；在此汇总团队等级、幸运、阵型属性/概率/技能效果。 */
export function partyUnits(state, fortune = null) {
  const f = fortune?.effect || {};
  const teamBonus = mainCharacterTeamBonusMultiplier(state);
  const units = (state.party || [])
    .map((id) => {
      const def = getCardDef(state, id);
      const st = cardStats(state, id);
      if (!def || !st) return null;
      const desperateRates = getDesperateCombatRates(id, def);
      const formationBonus = getFormationCombatBonuses(state.formation, id, state.party);
      const formationStats = getFormationStatBonuses(state.formation, id, state.party);
      const formationEffects = getFormationEffectBonuses(state.formation, id, state.party);
      const formationStatPct = formationStats.statPct;
      const hp = Math.max(1, Math.round(st.hp * teamBonus * (1 + (f.hp || 0)) * (1 + formationStatPct.hp)));
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
        atk: Math.max(1, Math.round(st.atk * teamBonus * (1 + (f.atk || 0)) * (1 + formationStatPct.atk))),
        def: Math.max(0, Math.round(st.def * teamBonus * (1 + (f.def || 0)) * (1 + formationStatPct.def))),
        spd: Math.max(1, Math.round(st.spd * (1 + (f.spd || 0)) * (1 + formationStatPct.spd))),
        crit: Math.min(0.75, st.crit + (f.crit || 0) + formationBonus.criticalPp),
        baseDesperateCritRate: desperateRates.desperateCritRate,
        baseDesperateDodgeRate: desperateRates.desperateDodgeRate,
        desperateCritRate: desperateRates.desperateCritRate,
        desperateDodgeRate: desperateRates.desperateDodgeRate,
        formationBonus,
        formationStats,
        critDamagePct: st.critDamagePct,
        damageDealtPct: st.damageDealtPct,
        damageReductionPct: st.damageReductionPct + formationEffects.damageReductionPct,
        skillEffectPct: formationEffects.skillEffectPct,
        skillDamagePct: formationEffects.skillDamagePct,
        mp: Math.max(1, Math.round(st.mp * teamBonus * (1 + formationStatPct.mp))),
        maxMp: Math.max(1, Math.round(st.mp * teamBonus * (1 + formationStatPct.mp))),
        lp: 6,
        maxLp: 6,
        healBonus: st.healBonus + (f.heal || 0),
        equipmentEffects: getEquipmentEffects(state, id),
        mpCostReductionPct: Math.min(0.5, st.mpCostReductionPct + formationEffects.mpCostReductionPct),
        formationEffects,
        formationActionOrder: formationEffects.actionOrder,
        formationPositionIndex: formationEffects.positionIndex,
        skills: def.skills,
      };
    })
    .filter(Boolean);

  const averagePartySpeed = units.length
    ? units.reduce((sum, unit) => sum + unit.spd, 0) / units.length
    : 0;

  return units.map((unit) => {
    const isHighSpeed = unit.spd > averagePartySpeed;
    const formationBonus = getFormationCombatBonuses(
      state.formation,
      unit.cardId,
      state.party,
      { isHighSpeed },
    );
    return {
      ...unit,
      isHighSpeed,
      formationBonus,
      desperateCritRate: Math.min(0.35, unit.baseDesperateCritRate + formationBonus.desperateCritPp),
      desperateDodgeRate: Math.min(
        0.45,
        unit.baseDesperateDodgeRate + formationBonus.dodgePp + formationBonus.highSpeedDodgePp,
      ),
    };
  });
}

/** 按 cardPower 估算值选出最多五名角色；该结果不直接改变玩家当前 party。 */
export function strongestParty(state) {
  const ids = Object.keys(state.cards || {}).filter((id) => getCardDef(state, id));
  return ids
    .map((id) => ({ id, power: cardPower(state, id) }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 5)
    .map((x) => x.id);
}