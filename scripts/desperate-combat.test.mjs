import test from 'node:test';
import assert from 'node:assert/strict';
import { HEROES, heroStats } from '../src/lib/gameData.js';
import { DESPERATE_COMBAT_RULES, getDesperateCombatRates, canTriggerDesperateCrit, canTriggerDesperateDodge, rollDesperateCrit, rollDesperateDodge } from '../src/lib/desperateCombat.js';

test('all 20 base heroes receive stable rates within the approved range', () => {
  assert.equal(HEROES.length, 20);
  const allRates=[];
  for (const hero of HEROES) {
    const def={...hero,stats:heroStats(hero)};
    const first=getDesperateCombatRates(hero.id,def);
    assert.deepEqual(first,getDesperateCombatRates(hero.id,def));
    assert.ok(first.desperateCritRate>=.1&&first.desperateCritRate<=.3);
    assert.ok(first.desperateDodgeRate>=.1&&first.desperateDodgeRate<=.3);
    assert.ok(Math.abs(first.desperateCritRate-first.baseRate)<=.0200001);
    assert.ok(Math.abs(first.desperateDodgeRate-first.baseRate)<=.0200001);
    allRates.push(first.desperateCritRate,first.desperateDodgeRate);
  }
  assert.ok(new Set(allRates).size>1);
});
test('higher initial ability lowers the base desperate-combat rate',()=>{
 const weak={hp:500,atk:500,def:500,spd:500,mp:500},strong={hp:1500,atk:1500,def:1500,spd:1500,mp:1500};
 const weakRate=getDesperateCombatRates('weak-test',{stats:weak}),strongRate=getDesperateCombatRates('strong-test',{stats:strong});
 assert.equal(weakRate.baseRate,.3);assert.equal(strongRate.baseRate,.1);assert.ok(weakRate.baseRate>strongRate.baseRate);
 assert.equal(DESPERATE_COMBAT_RULES.randomAdjustment,.02);
});
test('desperate critical threshold is strictly below 20 percent and excludes dead units',()=>{
 assert.equal(canTriggerDesperateCrit({side:'ally',alive:true,hp:20,maxHp:100}),false);
 assert.equal(canTriggerDesperateCrit({side:'ally',alive:true,hp:19,maxHp:100}),true);
 assert.equal(canTriggerDesperateCrit({side:'ally',alive:false,hp:10,maxHp:100}),false);
 assert.equal(canTriggerDesperateCrit({side:'enemy',alive:true,hp:10,maxHp:100}),false);
});
test('desperate dodge threshold is strictly below 10 percent and excludes dead units',()=>{
 assert.equal(canTriggerDesperateDodge({side:'ally',alive:true,hp:10,maxHp:100}),false);
 assert.equal(canTriggerDesperateDodge({side:'ally',alive:true,hp:9,maxHp:100}),true);
 assert.equal(canTriggerDesperateDodge({side:'ally',alive:false,hp:1,maxHp:100}),false);
 assert.equal(canTriggerDesperateDodge({side:'enemy',alive:true,hp:1,maxHp:100}),false);
});
test('critical and dodge rolls use each character rate and the supplied random source',()=>{
 const unit={side:'ally',alive:true,hp:5,maxHp:100,desperateCritRate:.2,desperateDodgeRate:.3};
 assert.equal(rollDesperateCrit(unit,()=>.19),true);assert.equal(rollDesperateCrit(unit,()=>.2),false);
 assert.equal(rollDesperateDodge(unit,()=>.29),true);assert.equal(rollDesperateDodge(unit,()=>.3),false);
});
