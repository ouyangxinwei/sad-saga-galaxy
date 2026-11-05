/**
 * 濒危战斗概率规则。
 *
 * 本模块只负责“濒危暴击/濒危闪避”的资格判断与概率生成，不处理普通暴击，
 * 也不负责实际伤害。普通暴击率来自角色/装备/阵型属性，在 battle.js 结算。
 *
 * 初始概率以全体 HEROES 的基础属性平均值作为参照，生成角色稳定的个体概率；
 * stableAdjustment 使用角色 ID 与效果类型做确定性扰动，同一角色不会每次启动
 * 游戏都重新抽取基础概率。真正触发时才由 roll* 使用随机数进行概率判定。
 *
 * 生命阈值、概率上下限与阵型后的最大上限集中在 DESPERATE_COMBAT_RULES；
 * 修改这些常量会影响战斗平衡和角色详情显示，需同步检查相关专项测试。
 */
import { HEROES, heroStats } from './gameData.js';
export const DESPERATE_COMBAT_RULES = Object.freeze({critHpRatio:0.2,dodgeHpRatio:0.1,baseRate:0.2,minRate:0.1,maxRate:0.3,formationCritMaxRate:0.35,formationDodgeMaxRate:0.45,randomAdjustment:0.02});
const STAT_KEYS=['hp','atk','def','spd','mp'];
const ROSTER_STATS=HEROES.map(hero=>heroStats(hero));
const ROSTER_AVERAGES=Object.freeze(Object.fromEntries(STAT_KEYS.map(stat=>[stat,ROSTER_STATS.reduce((sum,stats)=>sum+(Number(stats?.[stat])||0),0)/Math.max(1,ROSTER_STATS.length)])));
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
function hashUnit(value){let hash=2166136261;for(let i=0;i<value.length;i+=1){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0)/0xffffffff;}
function stableAdjustment(cardId,kind){return (hashUnit(`sad-saga-desperate-v1:${cardId}:${kind}`)*2-1)*DESPERATE_COMBAT_RULES.randomAdjustment;}
/** 根据角色基础能力相对全角色平均值计算稳定的濒危暴击/闪避基础概率。 */
export function getDesperateCombatRates(cardId,definition){
 const baseHero=HEROES.find(hero=>hero.id===cardId);
 const stats=definition?.stats||(baseHero?heroStats(baseHero):{});
 const ratios=STAT_KEYS.map(stat=>{const avg=ROSTER_AVERAGES[stat],value=Number(stats?.[stat]);return avg>0&&Number.isFinite(value)&&value>0?value/avg:1;});
 const initialAbilityIndex=ratios.reduce((sum,ratio)=>sum+ratio,0)/ratios.length;
 const baseRate=clamp(.2-(initialAbilityIndex-1)*.2,.1,.3);
 return {initialAbilityIndex,baseRate,desperateCritRate:clamp(baseRate+stableAdjustment(cardId,'critical'),.1,.3),desperateDodgeRate:clamp(baseRate+stableAdjustment(cardId,'dodge'),.1,.3)};
}
/** 仅我方存活单位且 HP 比例严格低于 20% 时具备濒危暴击资格。 */
export function canTriggerDesperateCrit(unit){return Boolean(unit?.side==='ally'&&unit.alive!==false&&Number(unit.hp)>0&&Number(unit.maxHp)>0&&Number(unit.hp)/Number(unit.maxHp)<.2);}
/** 仅我方存活单位且 HP 比例严格低于 10% 时具备濒危闪避资格。 */
export function canTriggerDesperateDodge(unit){return Boolean(unit?.side==='ally'&&unit.alive!==false&&Number(unit.hp)>0&&Number(unit.maxHp)>0&&Number(unit.hp)/Number(unit.maxHp)<.1);}
/** 在资格成立后，按单位当前概率掷骰；最终概率受 35% 上限约束。 */
export function rollDesperateCrit(unit,random=Math.random){return canTriggerDesperateCrit(unit)&&random()<clamp(Number(unit.desperateCritRate)||0,0,DESPERATE_COMBAT_RULES.formationCritMaxRate);}
/** 在资格成立后，按单位当前概率掷骰；最终概率受 45% 上限约束。 */
export function rollDesperateDodge(unit,random=Math.random){return canTriggerDesperateDodge(unit)&&random()<clamp(Number(unit.desperateDodgeRate)||0,0,DESPERATE_COMBAT_RULES.formationDodgeMaxRate);}
