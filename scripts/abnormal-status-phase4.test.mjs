import test from 'node:test';
import assert from 'node:assert/strict';
import { STATUS_DEFINITIONS, normalizeActiveStatuses } from '../src/lib/abnormalStatus.js';

test('all five abnormal statuses provide localized explanations', () => {
  for (const [type, definition] of Object.entries(STATUS_DEFINITIONS)) {
    for (const lang of ['zh', 'ja', 'en']) {
      assert.ok(definition.label[lang], `${type} label missing ${lang}`);
      assert.ok(definition.description[lang], `${type} description missing ${lang}`);
    }
  }
});

test('active status display data preserves remaining rounds and confusion level', () => {
  const statuses = normalizeActiveStatuses([
    { type: 'poison', remainingDuration: 2 },
    { type: 'confusion', level: 3, remainingDuration: 1 },
  ]);
  assert.deepEqual(statuses.map(({ type, level, remainingDuration }) => ({ type, level, remainingDuration })), [
    { type: 'poison', level: 1, remainingDuration: 2 },
    { type: 'confusion', level: 3, remainingDuration: 1 },
  ]);
});

test('defensive status indicators are defined for every supported ailment', () => {
  assert.deepEqual(Object.keys(STATUS_DEFINITIONS), ['sleep', 'paralysis', 'poison', 'blind', 'confusion']);
  for (const definition of Object.values(STATUS_DEFINITIONS)) {
    assert.ok(definition.short.zh && definition.short.ja && definition.short.en);
  }
});
