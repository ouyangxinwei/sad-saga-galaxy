/**
 * 挂机独立资源掉落的纯计算模块。
 *
 * GameContext 负责计算累计挂机时长并发放结算结果；本模块只负责完整小时数
 * 换算与随机掉落。每个小时内，gems、clearGems、tickets 都各自进行一次
 * 独立概率判定，因此同一小时可以掉落多种资源，也可能一种都不掉。
 * 传入 random 可用于测试时固定随机结果；默认使用 Math.random。
 */
export const IDLE_RESOURCE_DROP_KEYS = Object.freeze(['gems', 'clearGems', 'tickets']);
export const IDLE_RESOURCE_DROP_CHANCE = 0.30;
export const IDLE_HOUR_SECONDS = 60 * 60;

/** 将累计秒数向下取整为完整小时；不足一小时的部分留待后续累计。 */
export function getCompletedIdleHours(totalSeconds) {
  return Math.floor(Math.max(0, Number(totalSeconds) || 0) / IDLE_HOUR_SECONDS);
}

/** 对每个完整小时、每种资源分别掷骰并汇总数量，不修改玩家存档。 */
export function rollIdleResourceDrops(hours, random = Math.random) {
  const drops = { gems: 0, clearGems: 0, tickets: 0 };
  const count = Math.max(0, Math.floor(Number(hours) || 0));
  for (let hour = 0; hour < count; hour += 1) {
    IDLE_RESOURCE_DROP_KEYS.forEach((key) => {
      if (random() < IDLE_RESOURCE_DROP_CHANCE) drops[key] += 1;
    });
  }
  return drops;
}