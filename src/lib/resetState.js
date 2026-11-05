/** 测试/重置流程使用的初始资源常量；实际重置策略由调用方决定。 */
export const RESET_GEMS = 9999;
export const RESET_TICKETS = 9999;

/** 基于传入的默认状态创建重置状态，仅覆盖测试初始宝石与票券数量。 */
export function createResetState(defaultState) {
  return { ...defaultState, gems: RESET_GEMS, tickets: RESET_TICKETS };
}

/** 将重置结果写入指定 storage key；存储异常时返回 false，不向上抛出。 */
export function persistResetState(storage, key, state) {
  try {
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
