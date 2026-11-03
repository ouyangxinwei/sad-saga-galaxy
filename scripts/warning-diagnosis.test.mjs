import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWarningRecords, classifyWarning, runWarningSimulation } from '../src/lib/warningDiagnosis.js';

test('expected equipment trigger skips are informational, not actionable warnings', () => {
  for (const reason of ['chance_failed', 'cooldown', 'per_turn_limit', 'effect_not_applicable']) {
    const result = classifyWarning({ module: 'EquipmentTrigger', function: 'onAttack', event: 'WARN', level: 'WARN', detail: { reason } });
    assert.equal(result.severity, 'info'); assert.equal(result.category, 'expected-skip');
  }
});
test('console warnings and slow operations remain reviewable', () => {
  assert.equal(classifyWarning({ module: 'Console', event: 'CONSOLE_WARN', detail: { message: 'test' } }).category, 'runtime-console');
  assert.equal(classifyWarning({ module: 'Battle', event: 'SLOW', duration: 700 }).category, 'performance');
});
test('warning groups merge repeated records and retain sample details', () => {
  const groups = analyzeWarningRecords([
    { module: 'Console', function: 'warn', event: 'CONSOLE_WARN', timestamp: 't1', detail: { message: 'same' } },
    { module: 'Console', function: 'warn', event: 'CONSOLE_WARN', timestamp: 't2', detail: { message: 'same' } },
  ]);
  assert.equal(groups.length, 1); assert.equal(groups[0].count, 2); assert.equal(groups[0].samples.length, 2);
});
test('isolated repeatable battle simulations complete without actionable warnings', async () => {
  const report = await runWarningSimulation();
  assert.equal(report.scenarioCount, 4); assert.equal(report.scenarios.length, 4);
  assert.equal(report.warningCount, 0); assert.equal(report.status, 'simulation-clean');
  assert.ok(report.scenarios.every((item) => item.rounds > 0 && item.events > 0));
});
