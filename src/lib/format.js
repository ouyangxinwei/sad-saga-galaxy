export function fmt(n) {
  const v = Math.round(Number(n) || 0);
  if (Math.abs(v) >= 100000) return `${(v / 1000).toFixed(0)}k`;
  if (Math.abs(v) >= 10000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return v.toLocaleString('en-US');
}

export function countdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function pct(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}