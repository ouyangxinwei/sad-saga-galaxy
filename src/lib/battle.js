import { SKILLS } from './gameData.js';
import { traceSync, logInfo, logWarn } from './logger.js';
const rnd=(a,b)=>a+Math.random()*(b-a);
const BASIC={name:{zh:'普通攻击',ja:'通常攻撃',en:'Basic Attack'},kind:'attack',target:'single',power:1,mp:0};
function makeUnitImpl(c){return {...c,maxHp:c.maxHp||c.hp,hp:c.hp,shield:0,mp:c.maxMp??100,maxMp:c.maxMp??100,alive:true,taunt:0,dr:0,drTurns:0,lp:c.lp??0,maxLp:c.maxLp??0,crit:Math.min(.75,c.crit??.08),critDamagePct:c.critDamagePct??0,damageDealtPct:c.damageDealtPct??0,damageReductionPct:c.damageReductionPct??0,mpCostReductionPct:Math.min(.5,c.mpCostReductionPct??0),role:c.role||c.classId,skills:c.skills?.length?c.skills:['claw'],equipmentEffects:Array.isArray(c.equipmentEffects)?c.equipmentEffects:[]};}
export function applyEquipmentDamageModifiers(n,a,t){return n*(1+Math.min(1,Math.max(0,Number(a?.damageDealtPct)||0)))*(1-Math.min(.75,Math.max(0,Number(t?.damageReductionPct)||0)));}
export function criticalDamageMultiplier(u){return 1.65+Math.min(1,Math.max(0,Number(u?.critDamagePct)||0));}
export function healingMultiplier(u){return 1+Math.min(1.5,Math.max(0,Number(u?.healBonus)||0));}
export function effectiveMpCost(s,u){return Math.max(0,Math.round(Math.max(0,Number(s?.mp)||0)*(1-Math.min(.5,Math.max(0,Number(u?.mpCostReductionPct)||0)))));}
const lowRatio=a=>a.filter(x=>x.alive).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];
const lowHp=a=>a.filter(x=>x.alive).sort((x,y)=>x.hp-y.hp)[0];
export function createEquipmentRuntime(units,random=Math.random){return {units,random,cooldowns:new Map(),turnCounts:new Map(),counterDepth:0};}
const ALLOWED=new Set(['bonus_damage','counter','shield','heal_lowest','restore_mp']);
function note(level,event,owner,tr,reason,extra={}){const d={event,owner:owner?.uid,itemId:tr?.itemId,triggerId:tr?.id,reason,...extra};(level==='WARN'?logWarn:logInfo)('EquipmentTrigger',event,d);}
function die(target,units,events,killer,round,rt){
 target.alive=false;target.hp=0;target.taunt=0;events.push({kind:'death',tid:target.uid,target:target.name});
 if(killer)dispatchEquipmentEvent('onKill',{owner:killer,actor:killer,target},units,events,rt,round);
 if(target.lp<=0){events.push({kind:'perma',tid:target.uid,target:target.name});return;}
 const caster=units.filter(u=>u.side===target.side&&u.alive&&u!==target&&u.lp>0).sort((a,b)=>(b.role==='priest'?1:0)-(a.role==='priest'?1:0))[0];
 if(!caster){events.push({kind:'perma',tid:target.uid,target:target.name});return;}
 caster.lp--;target.lp--;target.alive=true;target.hp=Math.round(target.maxHp*.4);
 events.push({kind:'revive',tid:target.uid,target:target.name,caster:caster.name,casterUid:caster.uid,casterLp:caster.lp,lp:target.lp,hp:target.hp,maxHp:Math.round(target.maxHp)});
}
function directDamage(a,t,n,events,units,round,rt){
 if(!a?.alive||!t?.alive||n<=0)return;
 let d=Math.max(1,n),abs=Math.min(t.shield||0,d);t.shield=(t.shield||0)-abs;d-=abs;t.hp=Math.max(0,t.hp-d);
 events.push({kind:'damage',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,amount:Math.round(d),crit:false,shield:Math.round(t.shield),hp:Math.round(t.hp),maxHp:Math.round(t.maxHp),equipment:true});
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
   if(round<ready){note('WARN',name,owner,tr,'cooldown',{readyRound:ready,round});continue;}
   const turnKey=round+':'+key,count=rt.turnCounts.get(turnKey)||0,limit=Math.max(1,Number(tr.maxPerTurn)||1);
   if(count>=limit){note('WARN',name,owner,tr,'per_turn_limit',{count,limit});continue;}
   const chance=Math.min(1,Math.max(0,Number(tr.chance??1)));
   if(rt.random()>=chance){note('WARN',name,owner,tr,'chance_failed',{chance});continue;}
   const ok=applyEffect({...tr,itemId:tr.itemId},owner,{...context,eventName:name},units,events,rt,round);
   if(!ok){note('WARN',name,owner,tr,'effect_not_applicable');continue;}
   rt.turnCounts.set(turnKey,count+1);rt.cooldowns.set(key,round+Math.max(0,Number(tr.cooldown)||0)+1);fired++;
   note('INFO',name,owner,tr,'cooldown_set',{readyRound:rt.cooldowns.get(key)});
  }
 }return fired;
}
function chooseSkillImpl(u,allies,foes,round){
 const opts=[];u.skills.forEach(id=>{const s=SKILLS[id];if(!s||effectiveMpCost(s,u)>u.mp)return;let score=0,w=allies.filter(a=>a.alive&&a.hp<a.maxHp*.72);
 if(s.kind==='attack')score=s.target==='all'?28+foes.length*24:56;
 else if(s.kind==='support'){if(!w.length)score=0;else if(s.target==='all')score=72+w.length*14;else if(s.target==='random')score=68;else score=58+(1-w[0].hp/w[0].maxHp)*42;}
 else if(s.kind==='defense'){if(s.taunt)score=round<3?76:18;else if(s.mitigate)score=round<5?70:24;else score=allies.some(a=>a.alive&&a.hp<a.maxHp*.72)?66:12;}
 opts.push({sk:s,id,score:score*rnd(.92,1.08)});});
 opts.sort((a,b)=>b.score-a.score);return opts.length&&opts[0].score>40?opts[0]:{sk:BASIC,id:'basic'};
}
function damage(a,t,s,events,units,round,rt){
 const crit=Math.random()<a.crit+(s.critBonus||0);let d=a.atk*s.power*rnd(.93,1.07)*(crit?criticalDamageMultiplier(a):1);
 d=Math.max(1,d-t.def*(1-(s.pierce||0))*.45);if(t.dr)d*=1-t.dr;d=applyEquipmentDamageModifiers(d,a,t);
 const absorbed=Math.min(t.shield,d);t.shield-=absorbed;d-=absorbed;t.hp=Math.max(0,t.hp-d);
 events.push({kind:'damage',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,amount:Math.round(d),crit,shield:Math.round(t.shield),hp:Math.round(t.hp),maxHp:Math.round(t.maxHp)});
 dispatchEquipmentEvent('onAttack',{owner:a,actor:a,target:t},units,events,rt,round);
 if(crit)dispatchEquipmentEvent('onCritical',{owner:a,actor:a,target:t},units,events,rt,round);
 if(t.hp<=0)die(t,units,events,a,round,rt);else dispatchEquipmentEvent('onDamageTaken',{owner:t,actor:a,target:t},units,events,rt,round);
}
function heal(a,t,s,events,units,round,rt){
 const amount=Math.round(a.atk*s.heal*healingMultiplier(a)*rnd(.95,1.05)),n=Math.min(t.maxHp-t.hp,amount);t.hp+=n;
 events.push({kind:'heal',sid:a.uid,tid:t.uid,actor:a.name,target:t.name,amount:n,hp:Math.round(t.hp),maxHp:Math.round(t.maxHp)});
 dispatchEquipmentEvent('onHeal',{owner:a,actor:a,target:t},units,events,rt,round);
}
function act(u,units,round,events,rt){
 const allies=units.filter(x=>x.side===u.side&&x.alive),foes=units.filter(x=>x.side!==u.side&&x.alive);if(!foes.length)return;
 dispatchEquipmentEvent('onTurnStart',{owner:u,actor:u},units,events,rt,round);
 const {sk,id}=traceSync('Battle.chooseSkill',()=>chooseSkillImpl(u,allies,foes,round),{unit:u.uid,round});
 const cost=effectiveMpCost(sk,u);u.mp=Math.max(0,u.mp-cost);events.push({kind:'action',uid:u.uid,name:u.name,sid:u.uid,skill:sk.name,skillId:id,mp:u.mp,mpCost:cost});
 dispatchEquipmentEvent('onSkillUsed',{owner:u,actor:u,skill:sk,skillId:id},units,events,rt,round);
 if(sk.kind==='attack'){const taunts=foes.filter(f=>f.taunt>0),pool=taunts.length?taunts:foes,targets=sk.target==='all'?[...foes]:[lowHp(pool)||foes[0]];
 for(let h=0;h<(sk.hits||1);h++)targets.forEach(t=>{if(t?.alive)damage(u,t,sk,events,units,round,rt);});}
 else if(sk.kind==='support'){let targets;if(sk.target==='all')targets=allies;else if(sk.target==='random')targets=allies.filter(x=>x.alive&&x.hp<x.maxHp).sort(()=>Math.random()-.5).slice(0,sk.targets||2);else targets=[lowRatio(allies)||u];if(!targets.length)targets=[u];targets.forEach(t=>t&&heal(u,t,sk,events,units,round,rt));}
 else if(sk.taunt){const n=Math.round(u.maxHp*(sk.shield||.3));u.shield+=n;u.taunt=sk.taunt;events.push({kind:'shield',tid:u.uid,target:u.name,amount:n,shield:u.shield});events.push({kind:'taunt',tid:u.uid,target:u.name});}
 else if(sk.shield){const t=lowRatio(allies)||u,n=Math.round(t.maxHp*sk.shield);t.shield+=n;events.push({kind:'shield',tid:t.uid,target:t.name,amount:n,shield:t.shield});}
 else if(sk.mitigate){allies.forEach(x=>{x.dr=sk.mitigate;x.drTurns=sk.turns;});events.push({kind:'ward',name:u.name,value:sk.mitigate});}
 dispatchEquipmentEvent('onTurnEnd',{owner:u,actor:u},units,events,rt,round);
}
function simulateImpl(ac,ec,maxRounds=40,options={}){
 const units=[...ac.map(u=>makeUnit({...u,side:'ally'})),...ec.map((u,i)=>makeUnit({...u,side:'enemy',uid:'e_'+i}))],events=[],rt=createEquipmentRuntime(units,options.random||Math.random);
 const alive=s=>units.some(u=>u.side===s&&u.alive);
 dispatchEquipmentEvent('onBattleStart',{owner:null,actor:null},units,events,rt,0);
 let round=0;while(round<maxRounds&&alive('ally')&&alive('enemy')){round++;events.push({kind:'round',round});
 const order=units.filter(u=>u.alive).sort((a,b)=>b.spd-a.spd);
 for(const u of order)if(u.alive&&alive('ally')&&alive('enemy'))act(u,units,round,events,rt);
 units.forEach(u=>{u.mp=Math.min(u.maxMp,u.mp+14);if(u.drTurns>0&&--u.drTurns===0)u.dr=0;if(u.taunt>0)u.taunt--;});}
 const result=alive('enemy')?'lose':'win';dispatchEquipmentEvent('onBattleEnd',{owner:null,actor:null,result},units,events,rt,round);rt.cooldowns.clear();rt.turnCounts.clear();events.push({kind:'end',result});
 const final=Object.fromEntries(units.map(u=>[u.uid,{hp:Math.max(0,Math.round(u.hp)),maxHp:Math.round(u.maxHp),mp:Math.round(u.mp),maxMp:u.maxMp,lp:u.lp,shield:Math.round(u.shield),alive:u.alive}]));
 return {events,result,rounds:round,final,units};
}
export function makeUnit(c){return traceSync('Battle.makeUnit',()=>makeUnitImpl(c),{unit:c?.uid||c?.name||'unknown'});}
export function simulateBattle(a,e,maxRounds=40,options={}){return traceSync('Battle.simulateBattle',()=>simulateImpl(a,e,maxRounds,options),{allies:a?.length||0,enemies:e?.length||0,maxRounds});}
export function initialLive(units){return traceSync('Battle.initialLive',()=>Object.fromEntries(units.map(u=>[u.uid,{hp:Math.round(u.hp),maxHp:Math.round(u.maxHp),mp:Math.round(u.mp),maxMp:u.maxMp,lp:u.lp,shield:0,alive:true}])),{units:units?.length||0});}
export function applyEvent(live,ev){return traceSync('Battle.applyEvent',()=>{if(!ev)return live;const patch=(id,data)=>live[id]?{...live,[id]:{...live[id],...data}}:live;switch(ev.kind){case'damage':return patch(ev.tid,{hp:ev.hp,shield:ev.shield});case'heal':return patch(ev.tid,{hp:ev.hp});case'shield':return patch(ev.tid,{shield:ev.shield});case'death':case'perma':return patch(ev.tid,{alive:false,hp:0});case'revive':return {...patch(ev.tid,{alive:true,hp:ev.hp,lp:ev.lp}),...(ev.casterUid?{[ev.casterUid]:{...live[ev.casterUid],lp:ev.casterLp}}:{})};case'action':case'mp':return patch(ev.uid,{mp:ev.mp});default:return live;}},{eventKind:ev?.kind||'unknown'});}
