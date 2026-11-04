import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FORMATION_ID, FORMATIONS, createDefaultFormationState, normalizeFormationState, setActiveFormation, setFormationPosition } from '../src/lib/formationSystem.js';

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
