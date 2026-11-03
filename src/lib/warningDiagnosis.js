import { simulateBattle } from './battle.js';
import { captureDiagnosticLogs } from './logger.js';

export const DIAGNOSIS_REPORT_KEY = 'saga_galaxy_warning_diagnosis_v1';
const ally = (uid, name, role, skills, equipmentEffects = []) => ({ uid, name, role, classId: role, hp: 1250, maxHp: 1250, atk: 165, def: 82, spd: 100, mp: 120, maxMp: 120, crit: 0.12, lp: 2, maxLp: 2, skills, equipmentEffects });
const enemy = (uid, name) => ({ uid, name, role: 'enemy', classId: 'enemy', hp: 980, maxHp: 980, atk: 112, def: 58, spd: 76, mp: 80, maxMp: 80, crit: 0.04, skills: ['claw'] });
const equipment = [
  { id: 'diag-strike', itemId: 'diag-weapon', event: 'onAttack', chance: 1, cooldown: 1, maxPerTurn: 1, effect: { type: 'bonus_damage', value: 0.08 } },
  { id: 'diag-counter', itemId: 'diag-armor', event: 'onDamageTaken', when: 'target', chance: 1, cooldown: 1, maxPerTurn: 1, effect: { type: 'counter', value: 0.06 } },
  { id: 'diag-shield', itemId: 'diag-relic', event: 'onBattleStart', chance: 1, cooldown: 1, maxPerTurn: 1, effect: { type: 'shield', value: 0.08 } },
  { id: 'diag-mp', itemId: 'diag-relic', event: 'onSkillUsed', chance: 1, cooldown: 1, maxPerTurn: 1, effect: { type: 'restore_mp', value: 4 } },
  { id: 'diag-chance', itemId: 'diag-test', event: 'onTurnStart', chance: 0, cooldown: 0, maxPerTurn: 1, effect: { type: 'shield', value: 0.01 } },
];

export function classifyWarning(record) {
  const reason = record?.detail?.reason;
  if (['chance_failed', 'cooldown', 'per_turn_limit', 'effect_not_applicable'].includes(reason)) return { category: 'expected-skip', severity: 'info', title: '正常的装备触发判定', recommendation: '无需修复。这只是说明本次装备效果没有触发，不属于异常。' };
  if (record?.module === 'Console' || record?.event === 'CONSOLE_WARN') return { category: 'runtime-console', severity: 'review', title: '应用运行时 Console Warning', recommendation: '检查 message 与 stack，定位调用位置；确认不是第三方库已知提示后再修改。' };
  if (record?.duration >= 500 || record?.event === 'SLOW') return { category: 'performance', severity: 'review', title: '慢操作提示', recommendation: '检查耗时函数及调用链，优先分析重复计算、同步存储和大型状态更新，不要仅通过降低日志级别隐藏。' };
  return { category: 'application-warning', severity: 'review', title: '需要人工确认的 Warning', recommendation: '结合模块、函数、detail 和 stack 检查调用条件与数据边界；确认根因后再制定修复。' };
}

export function analyzeWarningRecords(records = []) {
  const groups = new Map();
  for (const record of records) {
    const classification = classifyWarning(record), detail = record?.detail || {};
    const key = [record?.module, record?.function, record?.event, detail.reason || detail.message || 'general'].join('|');
    const current = groups.get(key) || { key, module: record?.module || 'Unknown', function: record?.function || 'unknown', event: record?.event || 'WARN', count: 0, firstSeen: record?.timestamp || null, lastSeen: record?.timestamp || null, classification, samples: [] };
    current.count++; current.lastSeen = record?.timestamp || current.lastSeen;
    if (current.samples.length < 3) current.samples.push({ timestamp: record?.timestamp, detail });
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

export async function runWarningSimulation() {
  const startedAt = new Date().toISOString();
  const scenarios = [
    { id: 'basic-battle', label: '普通战斗', allies: [ally('a1', '先锋', 'sword', ['slash']), ally('a2', '守护者', 'guardian', ['provoke'])], enemies: [enemy('e1', '敌方剑士'), enemy('e2', '敌方弓手')] },
    { id: 'skill-and-heal', label: '技能与治疗', allies: [ally('a1', '术士', 'mage', ['bolt', 'nova']), ally('a2', '治疗者', 'priest', ['mend', 'sanctuary'])], enemies: [enemy('e1', '敌方战士'), enemy('e2', '敌方法师')] },
    { id: 'equipment-triggers', label: '装备触发与冷却', allies: [ally('a1', '装备测试者', 'sword', ['slash', 'whirl'], equipment), ally('a2', '支援者', 'priest', ['mend'])], enemies: [enemy('e1', '反击目标'), enemy('e2', '压力测试目标')] },
    { id: 'chance-failure', label: '概率失败边界', allies: [ally('a1', '概率测试者', 'guardian', ['provoke'], equipment)], enemies: [enemy('e1', '测试目标')] },
  ];
  const captured = await captureDiagnosticLogs(async () => {
    const results = [];
    for (const scenario of scenarios) {
      const random = scenario.id === 'chance-failure' ? () => 0.99 : () => 0.05;
      const result = simulateBattle(scenario.allies, scenario.enemies, 8, { random });
      results.push({ id: scenario.id, label: scenario.label, result: result.result, rounds: result.rounds, events: result.events.length, remainingAllies: Object.values(result.final).filter((unit) => unit.alive).length });
    }
    return results;
  });
  return { id: 'diagnosis-' + Date.now().toString(36), startedAt, completedAt: new Date().toISOString(), scenarioCount: scenarios.length, scenarios: captured.value, warningCount: captured.records.length, groups: analyzeWarningRecords(captured.records), status: captured.records.length ? 'review-required' : 'simulation-clean', note: '仅代表本次模拟场景；不能证明所有真实游戏路径均无 Warning。' };
}

export function readDiagnosisHistory() {
  try { const value = JSON.parse(localStorage.getItem(DIAGNOSIS_REPORT_KEY) || '[]'); return Array.isArray(value) ? value.slice(0, 20) : []; }
  catch { return []; }
}
export function saveDiagnosisReport(report) {
  const history = [report, ...readDiagnosisHistory()].slice(0, 20);
  try { localStorage.setItem(DIAGNOSIS_REPORT_KEY, JSON.stringify(history)); return true; }
  catch { return false; }
}
