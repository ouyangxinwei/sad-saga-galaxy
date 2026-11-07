import test from 'node:test';
import assert from 'node:assert/strict';
import { getStatusPresentation, normalizeActiveStatuses } from '../src/lib/abnormalStatus.js';

test('status presentation is localized and includes a readable duration', () => {
  const status = normalizeActiveStatuses([{ type: 'poison', remainingDuration: 2 }])[0];
  const zh = getStatusPresentation(status, 'zh');
  const ja = getStatusPresentation(status, 'ja');
  const en = getStatusPresentation(status, 'en');
  assert.equal(zh.label, '中毒');
  assert.equal(zh.remainingLabel, '剩余 2 回合');
  assert.equal(ja.remainingLabel, '残り 2 ターン');
  assert.equal(en.remainingLabel, '2 turns left');
  assert.match(en.ariaLabel, /Poison.*3% max HP.*2 turns left/);
});

test('confusion level is included in visible and accessible status labels', () => {
  const status = normalizeActiveStatuses([{ type: 'confusion', level: 3, remainingDuration: 1 }])[0];
  const zh = getStatusPresentation(status, 'zh');
  const ja = getStatusPresentation(status, 'ja');
  const en = getStatusPresentation(status, 'en');
  assert.equal(zh.level, 3);
  assert.match(zh.marker, /乱 3/);
  assert.match(zh.ariaLabel, /等级 3/);
  assert.match(ja.ariaLabel, /レベル 3/);
  assert.match(en.ariaLabel, /Level 3/);
});

test('unknown statuses do not produce a UI presentation', () => {
  assert.equal(getStatusPresentation({ type: 'unknown' }, 'en'), null);
});
