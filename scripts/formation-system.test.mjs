import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FORMATION_ID, FORMATIONS, createDefaultFormationState, getFormationCombatBonuses, getFormationStatBonuses, normalizeFormationState, setActiveFormation, setFormationPosition } from '../src/lib/formationSystem.js';

const party = ['hero-a', 'hero-b', 'hero-c', 'hero-d', 'hero-e'];

test('defines eight formations with five unique visual positions each', () => {
  assert.equal(FORMATIONS.length, 8);
  for (const formation of FORMATIONS) {
    assert.equal(formation.positions.length, 5, formation.id);
    assert.equal(new Set(formation.positions.map((position) => position.id)).size, 5, formation.id);
    for (const position of formation.positions) {
      assert.ok(position.x >= 0 && position.x <= 100, formation.id);
      assert.ok(position.y >= 0 && position.y <= 100, formation.id);
    }
  }
});

test('creates Balanced Ring by default and initializes all formation assignments', () => {
  const state = createDefaultFormationState(party);
  assert.equal(state.activeFormationId, DEFAULT_FORMATION_ID);
  assert.deepEqual(state.assignmentsByFormation.star, party);
  assert.deepEqual(state.assignmentsByFormation[DEFAULT_FORMATION_ID], party);
});

test('normalizes missing, duplicate, and no-longer-deployed assignments', () => {
  const state = normalizeFormationState({ activeFormationId: 'invalid', assignmentsByFormation: { star: ['hero-a', 'hero-a', 'retired'] } }, party);
  assert.equal(state.activeFormationId, DEFAULT_FORMATION_ID);
  assert.deepEqual(state.assignmentsByFormation.star, party);
  assert.equal(new Set(state.assignmentsByFormation.star.filter(Boolean)).size, 5);
});

test('swaps characters freely within one formation without changing the party roster', () => {
  const state = createDefaultFormationState(party);
  const next = setFormationPosition(state, 'star', 0, 'hero-e', party);
  assert.deepEqual(next.assignmentsByFormation.star, ['hero-e', 'hero-b', 'hero-c', 'hero-d', 'hero-a']);
  assert.deepEqual(party, ['hero-a', 'hero-b', 'hero-c', 'hero-d', 'hero-e']);
});

test('keeps assignments independent between formations', () => {
  const state = createDefaultFormationState(party);
  const next = setFormationPosition(state, 'star', 0, 'hero-e', party);
  assert.deepEqual(next.assignmentsByFormation['balanced-ring'], party);
});

test('rejects unknown formation ids, invalid slots, and characters outside the party', () => {
  const state = createDefaultFormationState(party);
  assert.equal(setActiveFormation(state, 'unknown', party), state);
  assert.equal(setFormationPosition(state, 'star', 8, 'hero-a', party), state);
  assert.equal(setFormationPosition(state, 'star', 0, 'unowned', party), state);
});

test('returns active formation chance bonuses for each assigned role', () => {
  const state = createDefaultFormationState(party);
  const balanced = getFormationCombatBonuses(state, 'hero-a', party);
  assert.equal(balanced.criticalPp, 0.03);
  assert.equal(balanced.dodgePp, 0.03);

  const spear = setActiveFormation(state, 'spearhead', party);
  assert.equal(getFormationCombatBonuses(spear, 'hero-b', party).criticalPp, 0.05);

  const star = setActiveFormation(state, 'star', party);
  assert.equal(getFormationCombatBonuses(star, 'hero-a', party).desperateCritPp, 0.05);

  const diamond = setActiveFormation(state, 'diamond-guard', party);
  assert.equal(getFormationCombatBonuses(diamond, 'hero-e', party).dodgePp, 0.10);
});

test('does not grant team formation bonuses to characters outside the active five slots', () => {
  const state = createDefaultFormationState(party);
  const bonus = getFormationCombatBonuses(state, 'not-in-party', party);
  assert.equal(bonus.criticalPp, 0);
  assert.equal(bonus.dodgePp, 0);
});


test('applies every formation stat modifier to the assigned five-member layout', () => {
  const state = createDefaultFormationState(party);
  const read = (formationId, cardId) => getFormationStatBonuses(setActiveFormation(state, formationId, party), cardId, party).statPct;

  assert.deepEqual(read('star', 'hero-a'), { hp: 0, atk: 0.30, def: 0, spd: 0, mp: 0 });
  assert.deepEqual(read('star', 'hero-b'), { hp: -0.10, atk: -0.10, def: -0.10, spd: -0.10, mp: -0.10 });
  assert.deepEqual(read('four-corner-core', 'hero-c'), { hp: 0, atk: 0, def: 0, spd: 0, mp: 0.25 });
  assert.equal(read('four-corner-core', 'hero-a').def, 0.05);
  assert.deepEqual(read('spearhead', 'hero-a'), { hp: 0, atk: 0.25, def: 0, spd: 0.15, mp: 0 });
  assert.equal(read('spearhead', 'hero-d').def, -0.10);
  assert.deepEqual(read('diamond-guard', 'hero-a'), { hp: 0.20, atk: 0, def: 0.25, spd: 0, mp: 0 });
  assert.deepEqual(read('long-serpent', 'hero-c'), { hp: 0, atk: 0, def: 0, spd: 0.10, mp: 0 });
  assert.equal(read('cross-support', 'hero-a').mp, 0.25);
  assert.deepEqual(read('staggered-skirmish', 'hero-c'), { hp: 0, atk: -0.05, def: 0, spd: 0, mp: 0 });
  assert.deepEqual(read('balanced-ring', 'hero-e'), { hp: 0.05, atk: 0, def: 0.05, spd: 0, mp: 0.10 });
});

test('does not apply stat bonuses to characters outside the active formation assignments', () => {
  const state = createDefaultFormationState(party);
  const bonus = getFormationStatBonuses(state, 'not-in-party', party);
  assert.deepEqual(bonus.statPct, { hp: 0, atk: 0, def: 0, spd: 0, mp: 0 });
});
