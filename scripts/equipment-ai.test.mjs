import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreSkills, makeUnit } from '../src/lib/battle.js';

const make=(skills,equipmentEffects=[])=>makeUnit({uid:'ai-hero',name:'AI Hero',side:'ally',hp:100,maxHp:100,atk:100,def:20,spd:10,mp:100,maxMp:100,skills,equipmentEffects});
const allies=(wounded=false)=>[
 {uid:'ai-hero',alive:true,hp:100,maxHp:100},
 {uid:'ally-2',alive:true,hp:wounded?30:100,maxHp:100},
];
const foes=[{uid:'foe-1',alive:true,hp:100,maxHp:100},{uid:'foe-2',alive:true,hp:100,maxHp:100}];
const score=(unit,id)=>scoreSkills(unit,allies(true),foes,2).find(x=>x.id===id);

test('no equipment preserves existing base skill scores',()=>{
 const unit=make(['slash','whirl','mend','provoke']);
 const result=scoreSkills(unit,allies(true),foes,2);
 assert.equal(result.find(x=>x.id==='slash').score,56);
 assert.equal(result.find(x=>x.id==='whirl').score,76);
 assert.equal(result.find(x=>x.id==='mend').bonus,0);
 assert.equal(result.find(x=>x.id==='provoke').bonus,0);
});

test('bonus-damage equipment raises attack and multi-target value',()=>{
 const plain=make(['slash','whirl']);
 const geared=make(['slash','whirl'],[{event:'onAttack',effect:{type:'bonus_damage',value:.25}}]);
 assert.ok(score(geared,'slash').score>score(plain,'slash').score);
 assert.ok(score(geared,'whirl').bonus>score(geared,'slash').bonus);
});

test('healing trigger improves support skill evaluation when allies are wounded',()=>{
 const plain=make(['mend','sanctuary']);
 const geared=make(['mend','sanctuary'],[{event:'onHeal',effect:{type:'heal_lowest',value:.2}}]);
 assert.ok(score(geared,'mend').score>score(plain,'mend').score);
});

test('shield and counter triggers improve defensive/taunt skill evaluation',()=>{
 const plain=make(['provoke','bulwark','ward']);
 const geared=make(['provoke','bulwark','ward'],[
  {event:'onDamageTaken',effect:{type:'counter',value:.25}},
  {event:'onTurnStart',effect:{type:'shield',value:.1}},
 ]);
 assert.ok(score(geared,'provoke').score>score(plain,'provoke').score);
 assert.ok(score(geared,'bulwark').score>score(plain,'bulwark').score);
 assert.ok(score(geared,'ward').score>score(plain,'ward').score);
});

test('post-skill MP recovery increases the value of affordable active skills only',()=>{
 const plain=make(['pierce','slash']);
 const geared=make(['pierce','slash'],[{event:'onSkillUsed',effect:{type:'restore_mp',value:20}}]);
 assert.ok(score(geared,'pierce').score>score(plain,'pierce').score);
 const lowMp=make(['pierce','slash'],[{event:'onSkillUsed',effect:{type:'restore_mp',value:20}}]);
 lowMp.mp=0;
 assert.equal(scoreSkills(lowMp,allies(true),foes,2).some(x=>x.id==='pierce'),false);
});
