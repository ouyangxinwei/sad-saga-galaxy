import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS } from '../src/lib/gameData.js';
import { makeUnit, scoreSkills, simulateBattle } from '../src/lib/battle.js';

test('every existing attack skill declares physical or magic damage', () => {
  for (const [id, skill] of Object.entries(SKILLS)) if (skill.kind === 'attack') assert.ok(['physical','magic'].includes(skill.damageType), id);
  assert.equal(SKILLS.slash.damageType, 'physical'); assert.equal(SKILLS.bolt.damageType, 'magic');
});
test('player skill catalog covers all five ailments with restrained proc chances', () => {
  const playerSkills = ['shot','bolt','nova','assassin','acid'].map(id => SKILLS[id]);
  assert.deepEqual(new Set(playerSkills.map(skill => skill.statusEffect?.type)), new Set(['blind','paralysis','sleep','confusion','poison']));
  for (const skill of playerSkills) assert.ok(skill.statusEffect.chance > 0 && skill.statusEffect.chance <= 0.2);
});
test('successful magic attack applies its configured status', () => {
  const result=simulateBattle([{uid:'mage',name:'Mage',hp:1000,maxHp:1000,atk:100,def:0,spd:100,crit:0,skills:['bolt']}],[{uid:'target',name:'Target',hp:10000,maxHp:10000,atk:0,def:0,spd:1,crit:0,skills:['claw']}],1,{random:()=>0});
  assert.ok(result.events.some(event=>event.kind==='status_applied'&&event.status.type==='paralysis'&&event.uid==='e_0'));
});
test('enemy attack skills can inflict their configured ailments', () => {
  const result=simulateBattle([{uid:'ally',name:'Ally',hp:10000,maxHp:10000,atk:0,def:0,spd:1,crit:0,skills:['slash']}],[{uid:'enemy',name:'Enemy',hp:10000,maxHp:10000,atk:100,def:0,spd:100,crit:0,skills:['howl']}],1,{random:()=>0});
  assert.ok(result.events.some(event=>event.kind==='status_applied'&&event.status.type==='confusion'&&event.uid==='ally'));
});
test('multi-hit skill applies at most one status per target per action', () => {
  const previous=SKILLS.shadow.statusEffect;
  SKILLS.shadow.statusEffect={type:'poison',chance:0.1};
  try {
    const result=simulateBattle([{uid:'rogue',name:'Rogue',hp:1000,maxHp:1000,atk:100,def:0,spd:100,crit:0,skills:['shadow']}],[{uid:'target',name:'Target',hp:10000,maxHp:10000,atk:0,def:0,spd:1,crit:0,skills:['claw']}],1,{random:()=>0});
    assert.equal(result.events.filter(event=>event.kind==='status_applied'&&event.uid==='e_0').length,1);
  } finally {
    if(previous===undefined)delete SKILLS.shadow.statusEffect;else SKILLS.shadow.statusEffect=previous;
  }
});
test('Sanctuary heals and cleanses all abnormal statuses from allies', () => {
  const result=simulateBattle([{uid:'priest',name:'Priest',hp:1000,maxHp:1000,atk:100,def:0,spd:100,crit:0,skills:['sanctuary']},{uid:'ally',name:'Ally',hp:500,maxHp:1000,atk:10,def:0,spd:1,crit:0,skills:['slash'],activeStatuses:[{type:'poison'},{type:'blind'}]}],[{uid:'enemy',name:'Enemy',hp:10000,maxHp:10000,atk:0,def:0,spd:1,crit:0,skills:['claw']}],1,{random:()=>0.99});
  assert.ok(result.events.some(event=>event.kind==='status_removed'&&event.statusType==='poison'&&event.reason==='cleanse'));
  assert.ok(result.events.some(event=>event.kind==='status_removed'&&event.statusType==='blind'&&event.reason==='cleanse'));
});
test('battle AI values cleansing for one afflicted ally even at full HP', () => {
  const priest=makeUnit({uid:'priest',side:'ally',hp:1000,maxHp:1000,atk:100,def:0,spd:100,skills:['sanctuary']});
  const ally=makeUnit({uid:'ally',side:'ally',hp:1000,maxHp:1000,atk:10,def:0,spd:1,skills:['slash'],activeStatuses:[{type:'paralysis'}]});
  const enemy=makeUnit({uid:'enemy',side:'enemy',hp:1000,maxHp:1000,atk:10,def:0,spd:1,skills:['claw']});
  assert.ok(scoreSkills(priest,[priest,ally],[enemy],1)[0].score>40);
});
test('Blind prevents a physical status skill from applying when the attack misses', () => {
  const result=simulateBattle([{uid:'archer',name:'Archer',hp:1000,maxHp:1000,atk:100,def:0,spd:100,crit:0,skills:['shot'],activeStatuses:[{type:'blind'}]}],[{uid:'target',name:'Target',hp:10000,maxHp:10000,atk:0,def:0,spd:1,crit:0,skills:['claw']}],1,{random:()=>0.99});
  assert.ok(result.events.some(event=>event.kind==='miss'&&event.reason==='blind'));
  assert.equal(result.events.some(event=>event.kind==='status_applied'&&event.uid==='e_0'),false);
});
