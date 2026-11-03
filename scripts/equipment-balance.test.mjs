import test from 'node:test';
import assert from 'node:assert/strict';
import { EQUIPMENT_CATALOG } from '../src/lib/gameData.js';
import { getEquipmentBonuses, getEquipmentEffects } from '../src/lib/equipment.js';

const events=new Set(['onBattleStart','onTurnStart','onAttack','onCritical','onDamageTaken','onHeal','onKill','onSkillUsed','onTurnEnd','onBattleEnd']);
const effects=new Set(['bonus_damage','counter','shield','heal_lowest','restore_mp']);
const slots=['weapon','armor','relic'];

test('all catalog entries have valid and bounded trigger configurations',()=>{
  let count=0;
  for(const slot of slots) for(const item of EQUIPMENT_CATALOG[slot]){
    for(const effect of item.effects||[]){
      count++;
      assert.ok(effect.id, item.id+' trigger requires an id');
      assert.ok(events.has(effect.event), item.id+' has an unsupported event');
      assert.ok(effects.has(effect.effect?.type), item.id+' has an unsupported effect');
      assert.ok(Number.isFinite(effect.chance)&&effect.chance>0&&effect.chance<=1, item.id+' chance must be in (0,1]');
      assert.ok(Number.isInteger(effect.cooldown)&&effect.cooldown>=0, item.id+' cooldown must be a non-negative integer');
      assert.ok(Number.isInteger(effect.maxPerTurn)&&effect.maxPerTurn>=1, item.id+' maxPerTurn must be a positive integer');
      assert.ok(['owner','target'].includes(effect.when), item.id+' must declare trigger ownership');
      assert.ok(Number.isFinite(effect.effect.value)&&effect.effect.value>0, item.id+' effect value must be positive');
    }
  }
  assert.equal(count,12,'all 12 catalog equipment effects should be audited');
});

test('all 54 weapon/armor/relic combinations remain finite and within combat safety caps',()=>{
  const maxima={hpPct:0,atkPct:0,defPct:0,spdPct:0,crit:0,critDamagePct:0,healPct:0,mpCostReductionPct:0,damageDealtPct:0,damageReductionPct:0};
  let combinations=0;
  for(const weapon of EQUIPMENT_CATALOG.weapon)
    for(const armor of EQUIPMENT_CATALOG.armor)
      for(const relic of EQUIPMENT_CATALOG.relic){
        const state={equipped:{hero:{weapon:weapon.id,armor:armor.id,relic:relic.id}}};
        const stats=getEquipmentBonuses(state,'hero');
        combinations++;
        for(const [key,value] of Object.entries(stats)){
          assert.ok(Number.isFinite(value), key+' must remain finite');
          if(key in maxima)maxima[key]=Math.max(maxima[key],Number(value.toFixed(2)));
        }
      }
  assert.equal(combinations,54);
  assert.deepEqual(maxima,{
    hpPct:.41,atkPct:.32,defPct:.22,spdPct:.28,crit:.03,critDamagePct:.20,
    healPct:.28,mpCostReductionPct:.12,damageDealtPct:.10,damageReductionPct:.13,
  });
});

test('equipped trigger collection preserves the three real catalog effects',()=>{
  const state={equipped:{hero:{weapon:'w_starblade',armor:'a_medic',relic:'r_tear'}}};
  const attached=getEquipmentEffects(state,'hero');
  assert.deepEqual(attached.map(x=>x.itemId).sort(),['a_medic','r_tear','w_starblade']);
  assert.equal(attached.length,3);
});
