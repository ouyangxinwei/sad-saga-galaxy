import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEquipmentRuntime, dispatchEquipmentEvent, makeUnit,
} from '../src/lib/battle.js';
import { getLogs } from '../src/lib/logger.js';

const unit=(uid,side='ally',extra={})=>makeUnit({
  uid,name:uid,side,hp:100,maxHp:100,atk:100,def:0,spd:10,mp:50,maxMp:100,
  skills:['slash'],...extra,
});
const trigger=(event,type,value,extra={})=>({
  id:'test-trigger',itemId:'test-item',event,chance:1,cooldown:0,maxPerTurn:1,
  when:'owner',effect:{type,value},...extra,
});
const setup=(effect,extra={})=>{
  const owner=unit('owner','ally',{equipmentEffects:[effect],...extra.owner});
  const enemy=unit('enemy','enemy',{...extra.enemy});
  const ally=unit('ally-2','ally',{hp:30,maxHp:100,...extra.ally});
  if(extra.owner?.mp!=null)owner.mp=extra.owner.mp;
  const units=[owner,enemy,ally],events=[];
  const rt=createEquipmentRuntime(units,extra.random||(()=>0));
  return {owner,enemy,ally,units,events,rt};
};

test('bonus damage is mitigated by target DEF and damage reduction',()=>{
  const {owner,enemy,units,events,rt}=setup(trigger('onAttack','bonus_damage',.5),{
    enemy:{def:100,damageReductionPct:.5},
  });
  assert.equal(dispatchEquipmentEvent('onAttack',{owner,actor:owner,target:enemy},units,events,rt,1),1);
  assert.ok(enemy.hp>97&&enemy.hp<98, '50 raw damage should be reduced by DEF and 50% damage reduction');
  assert.equal(events.find(e=>e.kind==='damage'&&e.equipment).equipment,true);
});

test('counter damage uses the same mitigation path and never recursively dispatches',()=>{
  const {owner,enemy,units,events,rt}=setup(trigger('onDamageTaken','counter',.5),{
    owner:{def:0},enemy:{def:100,damageReductionPct:.5},
  });
  assert.equal(dispatchEquipmentEvent('onDamageTaken',{owner,actor:enemy,target:owner},units,events,rt,1),1);
  assert.ok(enemy.hp>97&&enemy.hp<98);
  assert.equal(events.filter(e=>e.kind==='equipment').length,1);
});

test('shield trigger adds a max-HP based shield at battle start',()=>{
  const {owner,units,events,rt}=setup(trigger('onBattleStart','shield',.1));
  assert.equal(dispatchEquipmentEvent('onBattleStart',{owner:null,actor:null},units,events,rt,0),1);
  assert.equal(owner.shield,10);
});

test('heal-lowest trigger heals the lowest-ratio living ally',()=>{
  const {owner,ally,units,events,rt}=setup(trigger('onHeal','heal_lowest',.2));
  assert.equal(dispatchEquipmentEvent('onHeal',{owner,actor:owner,target:owner},units,events,rt,1),1);
  assert.equal(ally.hp,50);
});

test('restore-MP trigger respects the owner MP cap',()=>{
  const {owner,units,events,rt}=setup(trigger('onSkillUsed','restore_mp',80),{owner:{mp:95}});
  assert.equal(dispatchEquipmentEvent('onSkillUsed',{owner,actor:owner},units,events,rt,1),1);
  assert.equal(owner.mp,100);
});

test('positive cooldown blocks complete following rounds and then becomes ready',()=>{
  const {owner,units,events,rt}=setup(trigger('onAttack','shield',.1,{cooldown:1}));
  const context={owner,actor:owner,target:units[1]};
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,1),1);
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,2),0);
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,3),1);
  assert.equal(owner.shield,20);
});

test('zero cooldown allows same-turn checks while maxPerTurn enforces the cap',()=>{
  const {owner,units,events,rt}=setup(trigger('onAttack','shield',.1,{maxPerTurn:2}));
  const context={owner,actor:owner,target:units[1]};
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,1),1);
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,1),1);
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,1),0);
  assert.equal(owner.shield,30);
  assert.ok(getLogs().some(x=>x.module==='EquipmentTrigger'&&x.detail?.reason==='per_turn_limit'));
});

test('failed chance does not consume cooldown or per-turn count',()=>{
  const sequence=[.99,0];
  const {owner,units,events,rt}=setup(trigger('onAttack','shield',.1,{chance:.5}),{
    random:()=>sequence.shift()??0,
  });
  const context={owner,actor:owner,target:units[1]};
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,1),0);
  assert.equal(dispatchEquipmentEvent('onAttack',context,units,events,rt,1),1);
  assert.equal(owner.shield,10);
  assert.ok(getLogs().some(x=>x.module==='EquipmentTrigger'&&x.detail?.reason==='chance_failed'));
});

test('dead owners cannot trigger equipment effects',()=>{
  const {owner,units,events,rt}=setup(trigger('onAttack','shield',.1));
  owner.alive=false;
  assert.equal(dispatchEquipmentEvent('onAttack',{owner,actor:owner,target:units[1]},units,events,rt,1),0);
  assert.equal(owner.shield,0);
});

test('target-owned triggers only run for the matching target',()=>{
  const effect=trigger('onDamageTaken','shield',.1,{when:'target'});
  const {owner,enemy,units,events,rt}=setup(effect);
  assert.equal(dispatchEquipmentEvent('onDamageTaken',{owner:enemy,actor:owner,target:enemy},units,events,rt,1),0);
  assert.equal(dispatchEquipmentEvent('onDamageTaken',{owner:owner,actor:enemy,target:owner},units,events,rt,2),1);
  assert.equal(owner.shield,10);
});

test('battle-end triggers are dispatched and logged',()=>{
  const {owner,units,events,rt}=setup(trigger('onBattleEnd','restore_mp',10),{owner:{mp:20}});
  assert.equal(dispatchEquipmentEvent('onBattleEnd',{owner:null,actor:null,result:'win'},units,events,rt,3),1);
  assert.equal(owner.mp,30);
  assert.ok(getLogs().some(x=>x.module==='EquipmentTrigger'&&x.detail?.reason==='triggered'));
});
