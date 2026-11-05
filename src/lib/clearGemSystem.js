/**
 * 通关宝石（clear gems）快速结算规则。
 *
 * 本模块只提供批量选项归一化、可结算数量限制和已通关关卡校验；
 * 实际扣除宝石、生成奖励、写入统计/历史由 GameContext 的 quickClear action 执行。
 * 这里的 stage 校验用于防止对尚未通关或非法关卡执行快速结算。
 */
export const CLEAR_GEM_BATCHES = [10, 20];

/** 将请求的批量数量限制为支持的档位；非法值回退到默认档位。 */
export function normalizeClearGemBatch(requested) {
  return CLEAR_GEM_BATCHES.includes(Number(requested)) ? Number(requested) : 10;
}

/** 结算数量不能超过玩家当前持有的通关宝石数量。 */
export function getClearGemSettlementCount(balance, requested) {
  const owned = Math.max(0, Math.floor(Number(balance) || 0));
  return Math.min(normalizeClearGemBatch(requested), owned);
}

/** 判断指定关卡是否已包含在对应模式的已通关进度范围内。 */
export function isStageCleared(progress, stage) {
  const selected = Math.floor(Number(stage) || 0);
  const cleared = Math.max(0, Math.floor(Number(progress) || 0));
  return selected >= 1 && selected <= cleared;
}
