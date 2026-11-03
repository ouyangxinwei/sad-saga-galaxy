import test from 'node:test';
import assert from 'node:assert/strict';
import { equipItem } from '../src/lib/equipment.js';
test('Forge equip action continues to enforce Unique item ownership',()=>{
 const state={equipmentSchemaVersion:1,relics:{r_sword:1,r_aegis:1},equipmentInventory:{weapon:{},armor:{}},equipped:{lise:{weapon:null,armor:null,relic:'r_sword'},kain:{weapon:null,armor:null,relic:'r_aegis'}}};
 assert.equal(equipItem(state,'lise','relic','r_aegis').reason,'already_equipped');
 const removed=equipItem(state,'kain','relic',null);
 const reassigned=equipItem(removed.state,'lise','relic','r_aegis');
 assert.equal(reassigned.ok,true);
});
