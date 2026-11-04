/**
 * Shared five-stage campaign progression rules.
 * A cleared boss unlocks the following four minion stages without granting
 * their battle rewards; the next boss remains a required battle.
 */
export function getProgressAfterStageWin(currentProgress, stageNumber, isBoss, maxStage = 100) {
  const current = Math.max(0, Number(currentProgress) || 0);
  const stage = Math.max(1, Math.floor(Number(stageNumber) || 1));
  if (current !== stage - 1) return current;
  return isBoss ? Math.min(maxStage, stage + 4) : stage;
}

export function getNextStageAfterWin(mode, stageNumber, isBoss, maxStage = 100) {
  if (mode === 'tower' || mode === 'event') return null;
  const stage = Math.max(1, Math.floor(Number(stageNumber) || 1));
  return isBoss ? Math.min(maxStage, stage + 5) : Math.min(maxStage, stage + 1);
}
