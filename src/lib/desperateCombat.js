import { HEROES, heroStats } from './gameData.js';
export const DESPERATE_COMBAT_RULES = Object.freeze({critHpRatio:0.2,dodgeHpRatio:0.1,baseRate:0.2,minRate:0.1,maxRate:0.3,randomAdjustment:0.02});
const STAT_KEYS=['hp','atk','def','spd','mp'];
const ROSTER_STATS=HEROES.map(hero=>heroStats(hero));
const ROSTER_AVERAGES=Object.freeze(Object.fromEntries(STAT_KEYS.map(stat=>[stat,ROSTER_STATS.reduce((sum,stats)=>sum+(Number(stats?.[stat])||0),0)/Math.max(1,ROSTER_STATS.length)])));
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
function hashUnit(value){let hash=2166136261;for(let i=0;i<value.length;i+=1){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0)/0xffffffff;}
function stableAdjustment(cardId,kind){return (hashUnit(`sad-saga-desperate-v1:${cardId}:${kind}`)*2-1)*DESPERATE_COMBAT_RULES.randomAdjustment;}
export function getDesperateCombatRates(cardId,definition){
 const baseHero=HEROES.find(hero=>hero.id===cardId);
 const stats=definition?.stats||(baseHero?heroStats(baseHero):{});
 const ratios=STAT_KEYS.map(stat=>{const avg=ROSTER_AVERAGES[stat],value=Number(stats?.[stat]);return avg>0&&Number.isFinite(value)&&value>0?value/avg:1;});
 const initialAbilityIndex=ratios.reduce((sum,ratio)=>sum+ratio,0)/ratios.length;
 const baseRate=clamp(.2-(initialAbilityIndex-1)*.2,.1,.3);
 return {initialAbilityIndex,baseRate,desperateCritRate:clamp(baseRate+stableAdjustment(cardId,'critical'),.1,.3),desperateDodgeRate:clamp(baseRate+stableAdjustment(cardId,'dodge'),.1,.3)};
}
export function canTriggerDesperateCrit(unit){return Boolean(unit?.side==='ally'&&unit.alive!==false&&Number(unit.hp)>0&&Number(unit.maxHp)>0&&Number(unit.hp)/Number(unit.maxHp)<.2);}
export function canTriggerDesperateDodge(unit){return Boolean(unit?.side==='ally'&&unit.alive!==false&&Number(unit.hp)>0&&Number(unit.maxHp)>0&&Number(unit.hp)/Number(unit.maxHp)<.1);}
export function rollDesperateCrit(unit,random=Math.random){return canTriggerDesperateCrit(unit)&&random()<clamp(Number(unit.desperateCritRate)||0,0,.3);}
export function rollDesperateDodge(unit,random=Math.random){return canTriggerDesperateDodge(unit)&&random()<clamp(Number(unit.desperateDodgeRate)||0,0,.3);}
