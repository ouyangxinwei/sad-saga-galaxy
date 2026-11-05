/**
 * 主线关卡胜利后的统一推进规则。
 *
 * 当前规则以每五关为一个 Boss 周期：Boss 胜利后进度解锁后续四个小关，
 * 下一场实际战斗跳到下一个 Boss；跳过的小关不在这里发放战斗奖励。
 * 普通/困难/超困难模式应复用这组推进函数，避免各模式规则逐渐分叉。
 * tower/event 不使用常规主线下一关计算。
 */
/**
 * Shared five-stage campaign progression rules.
 * A cleared boss unlocks the following four minion stages without granting
 * their battle rewards; the next boss remains a required battle.
 */
/** 更新已解锁进度；仅当本次胜利关卡紧接当前进度时才推进，避免旧战斗回写覆盖新进度。 */
export function getProgressAfterStageWin(currentProgress, stageNumber, isBoss, maxStage = 100) {
  const current = Math.max(0, Number(currentProgress) || 0);
  const stage = Math.max(1, Math.floor(Number(stageNumber) || 1));
  if (current !== stage - 1) return current;
  return isBoss ? Math.min(maxStage, stage + 4) : stage;
}

/** 计算胜利后下一场要进入的关卡；Boss 后跨过四个小关，塔/活动模式返回 null。 */
export function getNextStageAfterWin(mode, stageNumber, isBoss, maxStage = 100) {
  if (mode === 'tower' || mode === 'event') return null;
  const stage = Math.max(1, Math.floor(Number(stageNumber) || 1));
  return isBoss ? Math.min(maxStage, stage + 5) : Math.min(maxStage, stage + 1);
}
