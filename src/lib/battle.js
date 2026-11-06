/**
 * 战斗模拟核心（Combat Simulation）。
 *
 * 本模块把我方/敌方单位转换为战斗运行态，按回合生成事件序列，
 * 最后返回胜负、回合数、最终单位状态及可供 UI 播放的 events。
 * 这里是战斗规则的执行层；角色基础属性和阵型加成由 cards.js /
 * formationSystem.js 在创建战斗单位前准备。
 *
 * 主要链路：simulateBattle -> simulateImpl -> orderBattleUnits -> act
 * -> damage/heal/防御效果 -> events -> applyEvent（UI 状态投影）。
 *
 * 注意：events 是战斗表现与结算之间的契约。新增/修改事件 kind 时，
 * 必须同步检查 BattleArena 等消费端；不要只改事件生成而遗漏 UI 应用。
 * 伤害、概率上限、装备触发和复活规则均属于业务规则，改动前先查专项测试。
 */
import { SKILLS } from './gameData.js';
import { rollDesperateCrit, rollDesperateDodge } from './desperateCombat.js';
import { applyAbnormalStatus, getAbnormalStatus, getActionBlockingStatus, getPhysicalAccuracyMultiplier, normalizeActiveStatuses, removeAbnormalStatus, resolveConfusionAction, tickAbnormalStatuses } from './abnormalStatus.js';
import { traceSync, logInfo, logWarn } from './logger.js';
const rnd=(a,b)=>a+Math.random()*(b-a);
const BASIC={name:{zh:'普通攻击',ja:'通常攻撃',en:'Basic Attack'},kind:'attack',target:'single',power:1,mp:0};
function makeUnitImpl(c){const raw=c.statusResistance||{};const statusResistance=Object.fromEntries(['poison','blind','paralysis','sleep','confusion'].map(type=>[type,Math.min(.6,Math.max(0,Number(typeof raw==='number'?raw:raw[type])||0))]));return {...c,maxHp:c.maxHp||c.hp,hp:c.hp,shield:0,mp:c.maxMp??100,maxMp:c.maxMp??100,alive:true,taunt:0,dr:0,drTurns:0,lp:c.lp??0,maxLp:c.maxLp??0,crit:Math.min(.75,c.crit??.08),desperateCritRate:Math.min(.35,Math.max(0,Number(c.desperateCritRate)||0)),desperateDodgeRate:Math.min(.45,Math.max(0,Number(c.desperateDodgeRate)||0)),critDamagePct:c.critDamagePct??0,damageDealtPct:c.damageDealtPct??0,damageReductionPct:c.damageReductionPct??0,mpCostReductionPct:Math.min(.5,c.mpCostReductionPct??0),statusResistance,isBoss:Boolean(c.isBoss),statusImmunities:Array.isArray(c.statusImmunities)?[...new Set(c.statusImmunities.filter(type=>['poison','blind','paralysis','sleep','confusion'].includes(type)))]:[],role:c.role||c.classId,skills:c.skills?.length?c.skills:['claw'],equipmentEffects:Array.isArray(c.equipmentEffects)?c.equipmentEffects:[],activeStatuses:normalizeActiveStatuses(c.activeStatuses)};}
export function applyEquipmentDamageModifiers(n,a,t){return n*(1+Math.min(1,Math.max(0,Number(a?.damageDealtPct)||0)))*(1-Math.min(.75,Math.max(0,Number(t?.damageReductionPct)||0)));}
export function criticalDamageMultiplier(u){return 1.65+Math.min(1,Math.max(0,Number(u?.critDamagePct)||0));}
export function healingMultiplier(u){return 1+Math.min(1.5,Math.max(0,Number(u?.healBonus)||0));}
export function effectiveMpCost(s,u){return Math.max(0,Math.round(Math.max(0,Number(s?.mp)||0)*(1-Math.min(.5,Math.max(0,Number(u?.mpCostReductionPct)||0)))));}
/** 根据速度排序，并在阵型指定时只重排我方行动槽；敌方相对位置沿用速度序列。 */
export function orderBattleUnits(units) {
 const speedOrder=[...units].sort((a,b)=>b.spd-a.spd);
 const allies=speedOrder.filter(unit=>unit.side==='ally');
 if(!allies.length)return speedOrder;
 const mode=allies.find(unit=>unit.formationActionOrder)?.formationActionOrder;
 if(!mode)return speedOrder;
 let formationOrder;
 if(mode==='formation-order'){
  formationOrder=[...allies].sort((a,b)=>(Number(a.formationPositionIndex)||0)-(Number(b.formationPositionIndex)||0));
 }else if(mode==='ally-last'){
  formationOrder=[...allies].sort((a,b)=>{
   const aLast=a.formationActionOrder==='ally-last'?1:0;
   const bLast=b.formationActionOrder==='ally-last'?1:0;
   return aLast-bLast || b.spd-a.spd;
  });
 }else return speedOrder;
 let allyIndex=0;
 return speedOrder.map(unit=>unit.side==='ally'?formationOrder[allyIndex++]:unit);
}
/** 将该单位已计算好的阵型技能增益应用到技能副本，不修改静态 SKILLS 定义。 */
export function applyFormationSkillModifiers(skill, unit) {
 const skillDamagePct=Math.min(1,Math.max(-.9,Number(unit?.skillDamagePct)||0));
 const skillEffectPct=Math.min(1,Math.max(-.9,Number(unit?.skillEffectPct)||0));
 const damageMultiplier=(1+skillDamagePct)*(1+skillEffectPct);
 const effectMultiplier=1+skillEffectPct;
 return {
  ...skill,
  formationModifiers: skillDamagePct > 0 || skillEffectPct > 0 ? { skillDamagePct, skillEffectPct } : null,
  ...(skill.power!==undefined?{power:skill.power*damageMultiplier}:{}),
  ...(skill.heal!==undefined?{heal:skill.heal*effectMultiplier}:{}),
  ...(skill.shield!==undefined?{shield:skill.shield*effectMultiplier}:{}),
  ...(skill.mitigate!==undefined?{mitigate:Math.min(1,skill.mitigate*effectMultiplier)}:{}),
 };
}
const lowRatio=a=>a.filter(x=>x.alive).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];
const lowHp=a=>a.filter(x=>x.alive).sort((x,y)=>x.hp-y.hp)[0];
export function createEquipmentRuntime(units,random=Math.random){return {units,random,cooldowns:new Map(),turnCounts:new Map(),counterDepth:0};}
const ALLOWED=new Set(['bonus_damage','counter','shield','heal_lowest','restore_mp']);
function note(level,event,owner,tr,reason,extra={}){const d={event,owner:owner?.uid,itemId:tr?.itemId,triggerId:tr?.id,reason,...extra};(level==='WARN'?logWarn:logInfo)('EquipmentTrigger',event,d);}
function die(target,units,events,killer,round,rt){
 clearBattleStatuses(target,events,'death');
 target.alive=false;target.hp=0;target.taunt=0;events.push({kind:'death',tid:target.uid,target:target.name});
 if(killer)dispatchEquipmentEvent('onKill',{owner:killer,actor:killer,target},units,events,rt,round);
 if(target.lp<=0){events.push({kind:'perma',tid:target.uid,target:target.name});return;}
 const caster=units.filter(u=>u.side===target.side&&u.alive&&u!==target&&u.lp>0).sort((a,b)=>(b.role==='priest'?1:0)-(a.role==='priest'?1:0))[0];
 if(!caster){events.push({kind:'perma',tid:target.uid,target:target.name});return;}
 caster.lp--;target.lp--;target.alive=true;target.hp=Math.round(target.maxHp*.4);
 events.push({kind:'revive',tid:target.uid,target:target.name,caster:caster.name,casterUid:caster.uid,casterLp:caster.lp,lp:target.lp,hp:target.hp,maxHp:Math.round(target.maxHp)});
}
function removeSleepAfterDamage(target,events){if(getAbnormalStatus(target?.activeStatuses,'sleep'))removeBattleStatus(target,'sleep',events,'damage');}
function clearBattleStatuses(unit,events,reason){for(const status of [...(unit.activeStatuses||[])])removeBattleStatus(unit,status.type,events,reason);}
export function getStatusApplicationRule(unit,type,baseChance){const chance=Math.min(1,Math.max(0,Number(baseChance)||0));if((unit?.statusImmunities||[]).includes(type))return {immune:true,resistance:1,chance:0};const resistance=Math.min(.6,Math.max(0,Number(unit?.statusResistance?.[type])||0));return {immune:false,resistance,chance:chance*(1-resistance)};}
export function applyBattleStatus(unit,type,options={},events=[]){
 if(!unit?.alive)return null;
 const result=applyAbnormalStatus(unit.activeStatuses,type,options);
 if(!result.applied)return null;
 unit.activeStatuses=result.statuses;
 events.push({kind:'status_applied',uid:unit.uid,name:unit.name,status:{...result.status},refreshed:result.refreshed});
 return result.status;
}
export function removeBattleStatus(unit,type,events=[],reason='effect'){
 const result=removeAbnormalStatus(unit?.activeStatuses,type);
 if(!result.removed)return null;
 unit.activeStatuses=result.statuses;
 events.push({kind:'status_removed',uid:unit.uid,name:unit.name,statusType:type,status:result.removed,reason});
 return result.removed;
}
function directDamage(a,t,n,events,units,round,rt){
 if(!a?.alive||!t?.alive||n<=0)return;
 let d=Math.max(1,n-(Number(t.def)||0)*.45);if(t.dr)d*=1-t.dr;d=applyEquipmentDamageModifiers(d,a,t);d=Math.max(1,d);const abs=Math.min(t.shield||0,d);t.shield=(t.shield||0)-abs;d-=abs;t.hp=Math.max(0,t.hp-d);
 events.push({kind:'damage',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,amount:Math.round(d),crit:false,shield:Math.round(t.shield),hp:Math.round(t.hp),maxHp:Math.round(t.maxHp),equipment:true});
 removeSleepAfterDamage(t,events);
 if(t.hp<=0&&t.alive)die(t,units,events,a,round,rt);
}
function applyEffect(tr,o,c,units,events,rt,round){
 const e=tr.effect||{},allies=units.filter(u=>u.side===o.side&&u.alive),target=c.target;
 switch(e.type){
 case 'bonus_damage': if(!target?.alive||target.side===o.side)return false;directDamage(o,target,o.atk*Math.max(0,Number(e.value)||0),events,units,round,rt);break;
 case 'counter': if(rt.counterDepth||!c.actor?.alive||c.actor.side===o.side)return false;rt.counterDepth++;try{directDamage(o,c.actor,o.atk*Math.max(0,Number(e.value)||0),events,units,round,rt);}finally{rt.counterDepth--;}break;
 case 'shield':{const amount=Math.max(1,Math.round(o.maxHp*Math.max(0,Number(e.value)||0)));o.shield+=amount;events.push({kind:'shield',tid:o.uid,target:o.name,amount,shield:o.shield,equipment:true});break;}
 case 'heal_lowest':{const t=lowRatio(allies);if(!t)return false;const n=Math.min(t.maxHp-t.hp,Math.max(1,Math.round(o.atk*Math.max(0,Number(e.value)||0))));if(n<=0)return false;t.hp+=n;events.push({kind:'heal',sid:o.uid,tid:t.uid,actor:o.name,target:t.name,amount:n,hp:Math.round(t.hp),maxHp:Math.round(t.maxHp),equipment:true});break;}
 case 'restore_mp':{const n=Math.min(o.maxMp-o.mp,Math.max(1,Math.round(Number(e.value)||0)));if(n<=0)return false;o.mp+=n;events.push({kind:'mp',uid:o.uid,name:o.name,amount:n,mp:o.mp,equipment:true});break;}
 default:return false;
 }
 events.push({kind:'equipment',actor:o.name,itemName:tr.itemName,label:tr.label,effectType:e.type});
 note('INFO',c.eventName||'equipment',o,tr,'triggered',{effectType:e.type});return true;
}
export function dispatchEquipmentEvent(name,context,units,events,rt,round=1){
 let fired=0;
 for(const owner of units){if(!owner.alive||!owner.equipmentEffects?.length)continue;
  for(let i=0;i<owner.equipmentEffects.length;i++){const tr=owner.equipmentEffects[i];if(tr.event!==name||!ALLOWED.has(tr.effect?.type))continue;
   if(tr.when==='target' ? context.target!==owner : (context.owner ? context.owner!==owner : !['onBattleStart','onBattleEnd'].includes(name)))continue;
   const key=owner.uid+':'+(tr.itemId||'item')+':'+(tr.id||i),ready=rt.cooldowns.get(key)||0;
   if(round<ready){note('INFO',name,owner,tr,'cooldown',{readyRound:ready,round});continue;}
   const turnKey=round+':'+key,count=rt.turnCounts.get(turnKey)||0,limit=Math.max(1,Number(tr.maxPerTurn)||1);
   if(count>=limit){note('INFO',name,owner,tr,'per_turn_limit',{count,limit});continue;}
   const chance=Math.min(1,Math.max(0,Number(tr.chance??1)));
   if(rt.random()>=chance){note('INFO',name,owner,tr,'chance_failed',{chance});continue;}
   const ok=applyEffect({...tr,itemId:tr.itemId},owner,{...context,eventName:name},units,events,rt,round);
   if(!ok){note('INFO',name,owner,tr,'effect_not_applicable');continue;}
   const cooldown=Math.max(0,Number(tr.cooldown)||0);rt.turnCounts.set(turnKey,count+1);rt.cooldowns.set(key,round+cooldown+(cooldown>0?1:0));fired++;
   note('INFO',name,owner,tr,'cooldown_set',{readyRound:rt.cooldowns.get(key)});
  }
 }return fired;
}
function equipmentAiProfile(unit) {
 const profile={offense:0,aoe:0,healing:0,defense:0,taunt:0,mp:0};
 for(const trigger of unit.equipmentEffects||[]){
  const effect=trigger?.effect||{},value=Math.min(1,Math.max(0,Number(effect.value)||0));
  if(effect.type==='bonus_damage'&&trigger.event==='onAttack')profile.offense+=8+value*12;
  if(effect.type==='bonus_damage'&&trigger.event==='onCritical')profile.offense+=5+value*10;
  if(effect.type==='counter'&&trigger.event==='onDamageTaken')profile.taunt+=6+value*18;
  if(effect.type==='shield'&&['onBattleStart','onTurnStart','onDamageTaken'].includes(trigger.event))profile.defense+=5+value*14;
  if(effect.type==='heal_lowest'&&['onHeal','onTurnStart'].includes(trigger.event))profile.healing+=6+value*14;
  if(effect.type==='restore_mp'&&trigger.event==='onSkillUsed')profile.mp+=5+Math.min(8,Math.max(0,Number(effect.value)||0)*.25);
 }
 profile.offense=Math.min(24,profile.offense);
 profile.defense=Math.min(20,profile.defense);
 profile.taunt=Math.min(20,profile.taunt);
 profile.healing=Math.min(22,profile.healing);
 profile.mp=Math.min(12,profile.mp);
 profile.aoe=profile.offense*.55;
 return profile;
}

export function scoreSkills(u,allies,foes,round=1){
 const profile=equipmentAiProfile(u);
 const wounded=allies.filter(a=>a.alive&&a.hp<a.maxHp*.72);
 const afflicted=allies.filter(a=>a.alive&&(a.activeStatuses||[]).length>0);
 const averageMissing=wounded.length?wounded.reduce((sum,a)=>sum+(1-a.hp/a.maxHp),0)/wounded.length:0;
 return (u.skills||[]).flatMap(id=>{
  const skill=SKILLS[id];
  if(!skill||effectiveMpCost(skill,u)>u.mp)return [];
  let baseScore=0,bonus=0;
  if(skill.kind==='attack'){
   baseScore=skill.target==='all'?28+foes.length*24:56;
   if(profile.offense)bonus+=profile.offense*(skill.target==='all'?1.15:.72);
   if(skill.target==='all'&&foes.length>=2)bonus+=profile.aoe*Math.min(1.5,(foes.length-1)*.5);
   if(skill.hits>1&&profile.offense)bonus+=profile.offense*.18;
  }else if(skill.kind==='support'){
   if(!wounded.length&&!(skill.cleanse&&afflicted.length))baseScore=0;
   else if(skill.target==='all')baseScore=(wounded.length?72+wounded.length*14:0)+(skill.cleanse&&afflicted.length?58+Math.min(30,(afflicted.length-1)*10):0);
   else if(skill.target==='random')baseScore=(wounded.length?68:0)+(skill.cleanse&&afflicted.length?50+Math.min(20,(afflicted.length-1)*8):0);
   else baseScore=58+(1-wounded[0].hp/wounded[0].maxHp)*42;
   if(baseScore>0&&profile.healing)bonus+=profile.healing*(.45+averageMissing);
  }else if(skill.kind==='defense'){
   if(skill.taunt)baseScore=round<3?76:18;
   else if(skill.mitigate)baseScore=round<5?70:24;
   else baseScore=allies.some(a=>a.alive&&a.hp<a.maxHp*.72)?66:12;
   if(skill.taunt&&profile.taunt)bonus+=profile.taunt;
   if((skill.shield||skill.mitigate)&&profile.defense)bonus+=profile.defense*(skill.mitigate?1:.85);
  }
  if(skill.mp>0&&profile.mp)bonus+=profile.mp*Math.min(1,skill.mp/30);
  return [{sk:skill,id,baseScore,bonus,score:baseScore+bonus}];
 });
}

function chooseSkillImpl(u,allies,foes,round){
 const opts=scoreSkills(u,allies,foes,round).map(option=>({...option,rolledScore:option.score*rnd(.92,1.08)}));
 opts.sort((a,b)=>b.rolledScore-a.rolledScore);
 const chosen=opts.length&&opts[0].rolledScore>40?opts[0]:{sk:BASIC,id:'basic',baseScore:0,bonus:0,score:0,rolledScore:0};
 logInfo('BattleAI','chooseSkill',{unit:u.uid,round,chosenSkillId:chosen.id,candidates:opts.map(({id,baseScore,bonus,score,rolledScore})=>({id,baseScore,bonus,score,rolledScore})),equipmentAware:(u.equipmentEffects||[]).length>0});
 return chosen;
}
/** 单次命中结算：先处理闪避，再计算普通暴击/伤害减免/护盾，最后派发装备事件与死亡处理。
 * 多段技能由 act 循环多次调用本函数，因此每次命中都会独立产生事件。
 */
function damage(a,t,s,events,units,round,rt,desperateCrit=false,hitIndex=1,hitCount=1,statusAppliedTargets=new Set()){
 const accuracyMultiplier=getPhysicalAccuracyMultiplier(a);
 if(s?.damageType==='physical'&&accuracyMultiplier<1&&rt.random()>=accuracyMultiplier){events.push({kind:'miss',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,reason:'blind',hitIndex,hitCount});return;}
 if(a?.side==='enemy'&&t?.side==='ally'&&rollDesperateDodge(t,rt.random)){events.push({kind:'dodge',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,rate:t.desperateDodgeRate,formationDodgePp:(Number(t.formationBonus?.dodgePp)||0)+(Number(t.formationBonus?.highSpeedDodgePp)||0),hp:Math.round(t.hp),maxHp:Math.round(t.maxHp),hitIndex,hitCount});return;}
 const critChance=Math.min(.75,Math.max(0,(Number(a.crit)||0)+(Number(s.critBonus)||0)+(Number(a.formationFollowUpCriticalPp)||0)));const crit=Math.random()<critChance;let d=a.atk*s.power*rnd(.93,1.07)*(crit?criticalDamageMultiplier(a):1);
 d=Math.max(1,d-t.def*(1-(s.pierce||0))*.45);if(t.dr)d*=1-t.dr;d=Math.max(1,applyEquipmentDamageModifiers(d,a,t));if(desperateCrit)d*=3;
 const absorbed=Math.min(t.shield,d);t.shield-=absorbed;d-=absorbed;t.hp=Math.max(0,t.hp-d);
 events.push({kind:'damage',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,amount:Math.round(d),crit,desperateCrit,formationEnhanced:Boolean(s?.formationModifiers),formationDamageReductionPct:Number(t.formationEffects?.damageReductionPct)||0,formationChancePp:(Number(a.formationBonus?.criticalPp)||0)+(Number(a.formationFollowUpCriticalPp)||0),formationDesperateCritPp:Number(a.formationBonus?.desperateCritPp)||0,shield:Math.round(t.shield),hp:Math.round(t.hp),maxHp:Math.round(t.maxHp),hitIndex,hitCount});
 dispatchEquipmentEvent('onAttack',{owner:a,actor:a,target:t},units,events,rt,round);
 if(crit||desperateCrit)dispatchEquipmentEvent('onCritical',{owner:a,actor:a,target:t},units,events,rt,round);
 removeSleepAfterDamage(t,events);
 if(t.hp<=0)die(t,units,events,a,round,rt);else {
  const statusEffect=s?.statusEffect;
  if(statusEffect&&!statusAppliedTargets.has(t.uid)){
   statusAppliedTargets.add(t.uid);
   const rule=getStatusApplicationRule(t,statusEffect.type,statusEffect.chance);
   if(rule.immune)events.push({kind:'status_immune',uid:t.uid,name:t.name,statusType:statusEffect.type,isBoss:Boolean(t.isBoss)});
   else {const roll=rt.random();if(roll<rule.chance)applyBattleStatus(t,statusEffect.type,{sourceId:a.uid,round},events);else if(rule.resistance>0&&roll<Math.min(1,Math.max(0,Number(statusEffect.chance)||0)))events.push({kind:'status_resisted',uid:t.uid,name:t.name,statusType:statusEffect.type,resistance:rule.resistance});}
  }
  dispatchEquipmentEvent('onDamageTaken',{owner:t,actor:a,target:t},units,events,rt,round);
 }
}
function heal(a,t,s,events,units,round,rt){
 const amount=Math.round(a.atk*s.heal*healingMultiplier(a)*rnd(.95,1.05)),n=Math.min(t.maxHp-t.hp,amount);t.hp+=n;
 events.push({kind:'heal',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,amount:n,hp:Math.round(t.hp),maxHp:Math.round(t.maxHp),formationEnhanced:Boolean(s?.formationModifiers)});
 dispatchEquipmentEvent('onHeal',{owner:a,actor:a,target:t},units,events,rt,round);
}
/** 执行一个单位的完整回合：装备回合触发、AI 选技、MP 扣除、目标选择、效果结算及回合结束触发。 */
function act(u,units,round,events,rt){
 const allies=units.filter(x=>x.side===u.side&&x.alive),foes=units.filter(x=>x.side!==u.side&&x.alive);if(!foes.length)return;
 const blockingStatus=getActionBlockingStatus(u);
 if(blockingStatus){events.push({kind:'status_blocked',uid:u.uid,name:u.name,statusType:blockingStatus.type});return;}
 dispatchEquipmentEvent('onTurnStart',{owner:u,actor:u},units,events,rt,round);
 const confusionAction=resolveConfusionAction(u,rt.random);
 if(confusionAction==='skip'){
  events.push({kind:'confusion_skip',uid:u.uid,name:u.name,level:1});
  dispatchEquipmentEvent('onTurnEnd',{owner:u,actor:u},units,events,rt,round);
  return;
 }
 const confusedCandidates=units.filter(target=>target.alive&&target!==u);
 const confusedTarget=confusionAction==='misdirect'||confusionAction==='berserk'?confusedCandidates[Math.floor(rt.random()*confusedCandidates.length)]:null;
 if(confusionAction)events.push({kind:'confusion_action',uid:u.uid,name:u.name,level:getAbnormalStatus(u.activeStatuses,'confusion')?.level||1,behavior:confusionAction,target:confusedTarget?.name});
 const choice=confusionAction==='berserk'?{sk:BASIC,id:'confusion_basic'}:traceSync('Battle.chooseSkill',()=>chooseSkillImpl(u,allies,foes,round),{unit:u.uid,round});
 const {sk,id}=choice;
 const cost=effectiveMpCost(sk,u);u.mp=Math.max(0,u.mp-cost);events.push({kind:'action',uid:u.uid,name:u.name,sid:u.uid,skill:sk.name,skillId:id,mp:u.mp,mpCost:cost,confused:Boolean(confusionAction),formationName:u.formationEffects?.formationName,formationSkillDamagePct:Number(u.skillDamagePct)||0,formationSkillEffectPct:Number(u.skillEffectPct)||0,formationMpCostReductionPct:Number(u.formationEffects?.mpCostReductionPct)||0});
 const resolvedSkill=id==='basic'||id==='confusion_basic'?sk:applyFormationSkillModifiers(sk,u);
 dispatchEquipmentEvent('onSkillUsed',{owner:u,actor:u,skill:sk,skillId:id},units,events,rt,round);
 if(sk.kind==='attack'){
  const taunts=foes.filter(f=>f.taunt>0),pool=taunts.length?taunts:foes;
  const targets=confusedTarget?[confusedTarget]:sk.target==='all'?[...foes]:[lowHp(pool)||foes[0]];
  const desperateCrit=rollDesperateCrit(u,rt.random),hitCount=Math.max(1,Number(sk.hits)||1),statusAppliedTargets=new Set();
  for(let h=0;h<hitCount;h++)targets.forEach(target=>{if(target?.alive)damage(u,target,resolvedSkill,events,units,round,rt,desperateCrit,h+1,hitCount,statusAppliedTargets);});
 }else if(sk.kind==='support'){
  let targets;
  if(confusedTarget)targets=[confusedTarget];else if(sk.target==='all')targets=allies;else if(sk.target==='random')targets=allies.filter(x=>x.alive&&(x.hp<x.maxHp||(sk.cleanse&&(x.activeStatuses||[]).length>0))).sort((a,b)=>((b.activeStatuses||[]).length-(a.activeStatuses||[]).length)||((a.hp/a.maxHp)-(b.hp/b.maxHp))).slice(0,sk.targets||2);else targets=[lowRatio(allies)||u];
  if(!targets.length)targets=[u];targets.forEach(target=>{if(!target)return;heal(u,target,resolvedSkill,events,units,round,rt);if(sk.cleanse)for(const status of [...(target.activeStatuses||[])])removeBattleStatus(target,status.type,events,'cleanse');});
 }else if(sk.taunt){const amount=Math.round(u.maxHp*(resolvedSkill.shield||.3));u.shield+=amount;u.taunt=sk.taunt;events.push({kind:'shield',tid:u.uid,target:u.name,amount,shield:u.shield,formationEnhanced:Boolean(resolvedSkill.formationModifiers)});events.push({kind:'taunt',tid:u.uid,target:u.name});}
 else if(resolvedSkill.shield){const target=lowRatio(allies)||u,amount=Math.round(target.maxHp*resolvedSkill.shield);target.shield+=amount;events.push({kind:'shield',tid:target.uid,target:target.name,amount,shield:target.shield,formationEnhanced:Boolean(resolvedSkill.formationModifiers)});}
 else if(resolvedSkill.mitigate){allies.forEach(x=>{x.dr=resolvedSkill.mitigate;x.drTurns=resolvedSkill.turns;});events.push({kind:'ward',name:u.name,value:resolvedSkill.mitigate,formationEnhanced:Boolean(resolvedSkill.formationModifiers)});}
 dispatchEquipmentEvent('onTurnEnd',{owner:u,actor:u},units,events,rt,round);
}
/** 战斗主循环。每轮记录实际行动顺序，逐个行动并更新持续状态，直至一方全灭或达到回合上限。 */
function processEndOfRoundStatuses(units,round,events,rt){
 for(const unit of units){
  if(!unit.alive||!unit.activeStatuses?.length)continue;
  const poison=getAbnormalStatus(unit.activeStatuses,'poison');
  if(poison){
   const amount=Math.max(1,Math.round(unit.maxHp*0.03));
   unit.hp=Math.max(0,unit.hp-amount);
   events.push({kind:'poison_damage',uid:unit.uid,name:unit.name,amount,hp:Math.round(unit.hp),maxHp:Math.round(unit.maxHp)});
   removeSleepAfterDamage(unit,events);
   if(unit.hp<=0&&unit.alive){die(unit,units,events,null,round,rt);continue;}
  }
  const previous=unit.activeStatuses,ticked=tickAbnormalStatuses(previous);
  if(ticked.statuses.length!==previous.length||ticked.statuses.some((status,index)=>status.remainingDuration!==previous[index]?.remainingDuration)){
   unit.activeStatuses=ticked.statuses;
   events.push({kind:'status_update',uid:unit.uid,activeStatuses:[...unit.activeStatuses]});
  }
  ticked.expired.forEach(status=>events.push({kind:'status_removed',uid:unit.uid,name:unit.name,statusType:status.type,status,reason:'expired'}));
 }
}
function simulateImpl(ac,ec,maxRounds=40,options={}){
 const units=[...ac.map(u=>makeUnit({...u,side:'ally'})),...ec.map((u,i)=>makeUnit({...u,side:'enemy',uid:'e_'+i}))],events=[],rt=createEquipmentRuntime(units,options.random||Math.random);
 const alive=s=>units.some(u=>u.side===s&&u.alive);
 dispatchEquipmentEvent('onBattleStart',{owner:null,actor:null},units,events,rt,0);
 let round=0;while(round<maxRounds&&alive('ally')&&alive('enemy')){round++;
 const order=orderBattleUnits(units.filter(u=>u.alive));
 events.push({kind:'round',round,order:order.map(({uid,name,side})=>({uid,name,side}))});
 let previousActedSide=null;
 for(const u of order)if(u.alive&&alive('ally')&&alive('enemy')){
  u.formationFollowUpCriticalPp=u.side==='ally'&&previousActedSide==='ally'?(Number(u.formationBonus?.followUpCriticalPp)||0):0;
  act(u,units,round,events,rt);
  previousActedSide=u.side;
  u.formationFollowUpCriticalPp=0;
 }
 units.forEach(u=>{u.mp=Math.min(u.maxMp,u.mp+14);if(u.drTurns>0&&--u.drTurns===0)u.dr=0;if(u.taunt>0)u.taunt--;});processEndOfRoundStatuses(units,round,events,rt);}
 const result=alive('enemy')?'lose':'win';dispatchEquipmentEvent('onBattleEnd',{owner:null,actor:null,result},units,events,rt,round);units.forEach(unit=>clearBattleStatuses(unit,events,'battle_end'));rt.cooldowns.clear();rt.turnCounts.clear();events.push({kind:'end',result});
 const final=Object.fromEntries(units.map(u=>[u.uid,{hp:Math.max(0,Math.round(u.hp)),maxHp:Math.round(u.maxHp),mp:Math.round(u.mp),maxMp:u.maxMp,lp:u.lp,shield:Math.round(u.shield),alive:u.alive,activeStatuses:[...(u.activeStatuses||[])]}]));
 return {events,result,rounds:round,final,units};
}
export function makeUnit(c){return traceSync('Battle.makeUnit',()=>makeUnitImpl(c),{unit:c?.uid||c?.name||'unknown'});}
/** 对外战斗入口；通过 traceSync 记录战斗规模与耗时，返回纯模拟结果供调用方播放/结算。 */
export function simulateBattle(a,e,maxRounds=40,options={}){return traceSync('Battle.simulateBattle',()=>simulateImpl(a,e,maxRounds,options),{allies:a?.length||0,enemies:e?.length||0,maxRounds});}
export function initialLive(units){return traceSync('Battle.initialLive',()=>Object.fromEntries(units.map(u=>[u.uid,{hp:Math.round(u.hp),maxHp:Math.round(u.maxHp),mp:Math.round(u.mp),maxMp:u.maxMp,lp:u.lp,shield:0,alive:true,activeStatuses:[...(u.activeStatuses||[])]}])),{units:units?.length||0});}
/** 将单条战斗事件折算到 UI 使用的 live 快照；它不重新计算伤害，只消费事件中已结算的数值。 */
export function applyEvent(live,ev){return traceSync('Battle.applyEvent',()=>{if(!ev)return live;const patch=(id,data)=>live[id]?{...live,[id]:{...live[id],...data}}:live;switch(ev.kind){case'damage':return patch(ev.tid,{hp:ev.hp,shield:ev.shield});case'heal':return patch(ev.tid,{hp:ev.hp});case'shield':return patch(ev.tid,{shield:ev.shield});case'death':case'perma':return patch(ev.tid,{alive:false,hp:0});case'revive':return {...patch(ev.tid,{alive:true,hp:ev.hp,lp:ev.lp}),...(ev.casterUid?{[ev.casterUid]:{...live[ev.casterUid],lp:ev.casterLp}}:{})};case'action':case'mp':return patch(ev.uid,{mp:ev.mp});case'poison_damage':return patch(ev.uid,{hp:ev.hp});case'status_applied':return patch(ev.uid,{activeStatuses:[...(live[ev.uid]?.activeStatuses||[]).filter(status=>status.type!==ev.status.type),ev.status]});case'status_removed':return patch(ev.uid,{activeStatuses:(live[ev.uid]?.activeStatuses||[]).filter(status=>status.type!==ev.statusType)});case'status_update':return patch(ev.uid,{activeStatuses:[...(ev.activeStatuses||[])]});default:return live;}},{eventKind:ev?.kind||'unknown'});}
