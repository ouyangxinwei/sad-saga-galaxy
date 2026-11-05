export const IDLE_RESOURCE_DROP_KEYS = Object.freeze(['gems', 'clearGems', 'tickets']);
export const IDLE_RESOURCE_DROP_CHANCE = 0.30;
export const IDLE_HOUR_SECONDS = 60 * 60;

export function getCompletedIdleHours(totalSeconds) {
  return Math.floor(Math.max(0, Number(totalSeconds) || 0) / IDLE_HOUR_SECONDS);
}

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