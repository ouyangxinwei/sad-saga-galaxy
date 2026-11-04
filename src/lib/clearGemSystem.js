export const CLEAR_GEM_BATCHES = [10, 20];

export function normalizeClearGemBatch(requested) {
  return CLEAR_GEM_BATCHES.includes(Number(requested)) ? Number(requested) : 10;
}

export function getClearGemSettlementCount(balance, requested) {
  const owned = Math.max(0, Math.floor(Number(balance) || 0));
  return Math.min(normalizeClearGemBatch(requested), owned);
}

export function isStageCleared(progress, stage) {
  const selected = Math.floor(Number(stage) || 0);
  const cleared = Math.max(0, Math.floor(Number(progress) || 0));
  return selected >= 1 && selected <= cleared;
}
