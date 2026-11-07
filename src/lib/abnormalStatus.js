/**
 * Abnormal status rules shared by the battle simulator and UI.
 * Durations are counted in battle rounds. Statuses are battle-local data.
 */
export const STATUS_DEFINITIONS = Object.freeze({
  sleep: { duration: 2, blocksAction: true, removedByDamage: true, label: { zh: '睡眠', ja: '睡眠', en: 'Sleep' }, short: { zh: '睡', ja: '眠', en: 'SLP' }, description: { zh: '无法行动；受到伤害后解除', ja: '行動不能。ダメージを受けると解除', en: 'Cannot act; removed after taking damage' } },
  paralysis: { duration: 2, blocksAction: true, removedByDamage: false, label: { zh: '麻痹', ja: '麻痺', en: 'Paralysis' }, short: { zh: '麻', ja: '痺', en: 'PAR' }, description: { zh: '无法行动；受到伤害不会解除', ja: '行動不能。ダメージでは解除されない', en: 'Cannot act; damage does not remove it' } },
  poison: { duration: 3, poisonDamagePct: 0.03, label: { zh: '中毒', ja: '毒', en: 'Poison' }, short: { zh: '毒', ja: '毒', en: 'PSN' }, description: { zh: '每回合结束受到最大 HP 的 3% 伤害', ja: '各ターン終了時に最大 HP の 3% のダメージ', en: 'Takes damage equal to 3% max HP at round end' } },
  blind: { duration: 3, physicalAccuracyMultiplier: 0.6, label: { zh: '失明', ja: '暗闇', en: 'Blind' }, short: { zh: '盲', ja: '盲', en: 'BLD' }, description: { zh: '物理攻击命中率降低至 60%', ja: '物理攻撃の命中率が 60% に低下', en: 'Physical accuracy is reduced to 60%' } },
  confusion: { duration: 3, maxLevel: 3, label: { zh: '混乱', ja: '混乱', en: 'Confusion' }, short: { zh: '乱', ja: '乱', en: 'CNF' }, description: { zh: 'Lv.1 可能失去行动；Lv.2 可能攻击错误目标；Lv.3 失控攻击', ja: 'Lv.1 は行動不能の可能性、Lv.2 は対象を誤る可能性、Lv.3 は暴走', en: 'Lv.1 may lose a turn; Lv.2 may misdirect; Lv.3 berserks' } },
});
export const STATUS_TYPES = Object.freeze(Object.keys(STATUS_DEFINITIONS));

/** Build localized, accessible text for a status marker without changing battle rules. */
export function getStatusPresentation(status, lang = 'en') {
  const definition = STATUS_DEFINITIONS[status?.type];
  if (!definition) return null;
  const language = ['zh', 'ja', 'en'].includes(lang) ? lang : 'en';
  const label = definition.label[language] || definition.label.en;
  const description = definition.description?.[language] || definition.description?.en || label;
  const short = definition.short[language] || definition.short.en;
  const remaining = Math.max(0, Math.floor(Number(status?.remainingDuration) || 0));
  const remainingLabel = language === 'zh'
    ? `剩余 ${remaining} 回合`
    : language === 'ja'
      ? `残り ${remaining} ターン`
      : `${remaining} turns left`;
  const level = status?.type === 'confusion'
    ? Math.min(definition.maxLevel, Math.max(1, Math.floor(Number(status.level) || 1)))
    : null;
  const levelLabel = level
    ? language === 'zh' ? `等级 ${level}` : language === 'ja' ? `レベル ${level}` : `Level ${level}`
    : '';
  const marker = `${short}${level ? ` ${level}` : ''} · ${remaining}`;
  return {
    label,
    description,
    short,
    remaining,
    remainingLabel,
    level,
    marker,
    ariaLabel: `${label}. ${description}. ${remainingLabel}${levelLabel ? `. ${levelLabel}` : ''}`,
  };
}

export function normalizeActiveStatuses(statuses) {
  if (!Array.isArray(statuses)) return [];
  return statuses.flatMap((entry) => {
    const type = entry?.type;
    const definition = STATUS_DEFINITIONS[type];
    if (!definition) return [];
    const duration = Math.floor(Number(entry.remainingDuration ?? entry.duration ?? definition.duration));
    if (!Number.isFinite(duration) || duration <= 0) return [];
    const level = Math.min(definition.maxLevel ?? 1, Math.max(1, Math.floor(Number(entry.level) || 1)));
    return [{ type, level, remainingDuration: duration, sourceId: entry.sourceId ?? null, appliedRound: Math.max(0, Math.floor(Number(entry.appliedRound) || 0)) }];
  });
}
export function getAbnormalStatus(statuses, type) {
  return (statuses || []).find((status) => status.type === type) ?? null;
}
export function applyAbnormalStatus(statuses, type, options = {}) {
  const definition = STATUS_DEFINITIONS[type];
  if (!definition) return { statuses: normalizeActiveStatuses(statuses), status: null, applied: false };
  const current = normalizeActiveStatuses(statuses);
  const existing = getAbnormalStatus(current, type);
  const duration = Math.max(1, Math.floor(Number(options.duration) || definition.duration));
  const level = type === 'confusion' ? Math.min(definition.maxLevel, (existing?.level || 0) + 1) : 1;
  const status = { type, level, remainingDuration: duration, sourceId: options.sourceId ?? existing?.sourceId ?? null, appliedRound: Math.max(0, Math.floor(Number(options.round) || 0)) };
  const next = existing ? current.map((item) => item.type === type ? status : item) : [...current, status];
  return { statuses: next, status, applied: true, refreshed: Boolean(existing) };
}
export function removeAbnormalStatus(statuses, type) {
  const current = normalizeActiveStatuses(statuses);
  const removed = current.find((status) => status.type === type) ?? null;
  return { statuses: current.filter((status) => status.type !== type), removed };
}
export function tickAbnormalStatuses(statuses) {
  const next = [], expired = [];
  for (const status of normalizeActiveStatuses(statuses)) {
    const remainingDuration = status.remainingDuration - 1;
    if (remainingDuration <= 0) expired.push(status);
    else next.push({ ...status, remainingDuration });
  }
  return { statuses: next, expired };
}
export function getActionBlockingStatus(unit) {
  return (unit?.activeStatuses || []).find((status) => STATUS_DEFINITIONS[status.type]?.blocksAction) ?? null;
}
export function getPhysicalAccuracyMultiplier(unit) {
  return getAbnormalStatus(unit?.activeStatuses, 'blind') ? STATUS_DEFINITIONS.blind.physicalAccuracyMultiplier : 1;
}
/** Lv.1 may skip, Lv.2 may misdirect, and Lv.3 always berserks. */
export function resolveConfusionAction(unit, random = Math.random) {
  const confusion = getAbnormalStatus(unit?.activeStatuses, 'confusion');
  if (!confusion) return null;
  if (confusion.level === 1) return random() < 0.3 ? 'skip' : null;
  if (confusion.level === 2) return random() < 0.5 ? 'misdirect' : null;
  return 'berserk';
}
