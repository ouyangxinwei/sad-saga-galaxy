import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUS_DEFINITIONS, applyAbnormalStatus, getAbnormalStatus, getActionBlockingStatus,
  getPhysicalAccuracyMultiplier, normalizeActiveStatuses, removeAbnormalStatus,
  resolveConfusionAction, tickAbnormalStatuses,
} from '../src/lib/abnormalStatus.js';
import { makeUnit, simulateBattle } from '../src/lib/battle.js';

test('five first-phase statuses expose approved durations and effects', () => {
  assert.deepEqual(Object.keys(STATUS_DEFINITIONS), ['sleep','paralysis','poison','blind','confusion']);
  assert.equal(STATUS_DEFINITIONS.sleep.duration, 2);
  assert.equal(STATUS_DEFINITIONS.paralysis.duration, 2);
  assert.equal(STATUS_DEFINITIONS.poison.duration, 3);
  assert.equal(STATUS_DEFINITIONS.poison.poisonDamagePct, 0.03);
  assert.equal(STATUS_DEFINITIONS.blind.physicalAccuracyMultiplier, 0.6);
  assert.equal(STATUS_DEFINITIONS.confusion.maxLevel, 3);
});
test('normalization discards unknown and expired statuses', () => {
  assert.deepEqual(normalizeActiveStatuses([{type:'sleep',remainingDuration:2},{type:'unknown',remainingDuration:5},{type:'poison',remainingDuration:0}]), [
    {type:'sleep',level:1,remainingDuration:2,sourceId:null,appliedRound:0},
  ]);
});
test('reapplying refreshes duration and raises confusion only to level three', () => {
  let statuses=applyAbnormalStatus([], 'poison', {duration:3,round:1}).statuses;
  const refreshed=applyAbnormalStatus(statuses,'poison',{duration:3,round:2});
  assert.equal(refreshed.refreshed,true); assert.equal(refreshed.status.remainingDuration,3); assert.equal(refreshed.statuses.length,1);
  statuses=applyAbnormalStatus([],'confusion').statuses;
  for(let i=0;i<4;i++)statuses=applyAbnormalStatus(statuses,'confusion').statuses;
  assert.equal(getAbnormalStatus(statuses,'confusion').level,3);
});
test('sleep and paralysis block actions but only sleep is removed by damage', () => {
  const sleep=makeUnit({uid:'sleep',hp:100,maxHp:100,activeStatuses:[{type:'sleep'}]});
  const paralysis=makeUnit({uid:'paralysis',hp:100,maxHp:100,activeStatuses:[{type:'paralysis'}]});
  assert.equal(getActionBlockingStatus(sleep).type,'sleep'); assert.equal(getActionBlockingStatus(paralysis).type,'paralysis');
  assert.equal(STATUS_DEFINITIONS.sleep.removedByDamage,true); assert.equal(STATUS_DEFINITIONS.paralysis.removedByDamage,false);
});
test('blind applies a 60 percent multiplier to physical accuracy only', () => {
  const blind=makeUnit({uid:'blind',hp:100,maxHp:100,activeStatuses:[{type:'blind'}]});
  assert.equal(getPhysicalAccuracyMultiplier(blind),0.6);
  assert.equal(getPhysicalAccuracyMultiplier(makeUnit({uid:'clear',hp:100,maxHp:100})),1);
});
test('confusion levels resolve to skip, misdirect, and berserk policies', () => {
  const unit=(level)=>makeUnit({uid:'confused-'+level,hp:100,maxHp:100,activeStatuses:[{type:'confusion',level}]});
  assert.equal(resolveConfusionAction(unit(1),()=>0.29),'skip'); assert.equal(resolveConfusionAction(unit(1),()=>0.3),null);
  assert.equal(resolveConfusionAction(unit(2),()=>0.49),'misdirect'); assert.equal(resolveConfusionAction(unit(2),()=>0.5),null);
  assert.equal(resolveConfusionAction(unit(3),()=>0.99),'berserk');
});
test('status duration expires after its configured number of round ticks', () => {
  let statuses=applyAbnormalStatus([],'sleep').statuses;
  statuses=tickAbnormalStatuses(statuses).statuses;
  assert.equal(getAbnormalStatus(statuses,'sleep').remainingDuration,1);
  const ticked=tickAbnormalStatuses(statuses); assert.equal(ticked.statuses.length,0); assert.equal(ticked.expired[0].type,'sleep');
});
test('battle skips sleeping actors and applies end-of-round poison damage', () => {
  const originalRandom=Math.random; Math.random=()=>0.5;
  try {
    const result=simulateBattle(
      [{uid:'a_sleep',name:'Sleeping ally',hp:100,maxHp:100,atk:10,def:0,spd:100,crit:0,skills:['slash'],activeStatuses:[{type:'sleep',remainingDuration:2}]}],
      [{uid:'e_poison',name:'Poisoned enemy',hp:1000,maxHp:1000,atk:0,def:0,spd:1,crit:0,skills:['claw'],activeStatuses:[{type:'poison',remainingDuration:1}]}],
      1,{random:()=>0.99},
    );
    assert.ok(result.events.some(event=>event.kind==='status_blocked'&&event.statusType==='sleep'));
    assert.ok(result.events.some(event=>event.kind==='poison_damage'&&event.amount===30));
    assert.ok(result.events.some(event=>event.kind==='status_removed'&&event.statusType==='poison'&&event.reason==='expired'));
    assert.equal(result.final.a_sleep.activeStatuses.length,0);
  } finally { Math.random=originalRandom; }
});
test('damage wakes a sleeping unit but does not clear paralysis', () => {
  const originalRandom=Math.random; Math.random=()=>0.5;
  try {
    const result=simulateBattle(
      [
        {uid:'a_sleep',name:'Sleeping ally',hp:100,maxHp:100,atk:10,def:0,spd:1,crit:0,skills:['slash'],activeStatuses:[{type:'sleep',remainingDuration:2}]},
        {uid:'a_paralysis',name:'Paralyzed ally',hp:100,maxHp:100,atk:10,def:0,spd:2,crit:0,skills:['slash'],activeStatuses:[{type:'paralysis',remainingDuration:2}]},
      ],
      [{uid:'e_fast',name:'Fast enemy',hp:1000,maxHp:1000,atk:10,def:0,spd:100,crit:0,skills:['claw']}],
      1,{random:()=>0.99},
    );
    assert.ok(result.events.some(event=>event.kind==='status_removed'&&event.statusType==='sleep'&&event.reason==='damage'));
    assert.equal(result.events.some(event=>event.kind==='status_removed'&&event.statusType==='paralysis'&&event.reason==='damage'),false);
  } finally { Math.random=originalRandom; }
});
test('battle end clears temporary statuses', () => {
  const result=simulateBattle([{uid:'a',hp:100,maxHp:100,atk:10,def:0,spd:1,activeStatuses:[{type:'blind'}]}],[{uid:'e',hp:1000,maxHp:1000,atk:0,def:0,spd:2}],1,{random:()=>0.99});
  assert.equal(result.final.a.activeStatuses.length,0);
  assert.ok(result.events.some(event=>event.kind==='status_removed'&&event.reason==='battle_end'));
});
test('removing a missing status is idempotent', () => {
  const result=removeAbnormalStatus([{type:'sleep'}],'poison'); assert.equal(result.removed,null); assert.equal(result.statuses.length,1);
});
