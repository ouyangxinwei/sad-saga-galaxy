import GameIcon from './GameIcon';

export function GoldButton({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tap relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-b from-primary/25 to-primary/[0.06] px-4 py-2 text-[11px] tracking-[0.12em] text-primary shadow-[0_10px_28px_-16px_rgba(232,200,122,0.8)] hover:from-primary/30 disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, className = '', active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`tap rounded-xl border px-3 py-2 text-[11px] tracking-wide disabled:opacity-35 ${
        active
          ? 'border-primary/45 bg-primary/12 text-primary'
          : 'border-white/12 bg-white/[0.04] text-foreground/80 hover:border-white/25 hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Chip({ children, color, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[9px] tracking-wider ${className}`}
      style={{ borderColor: `${color}3d`, color, background: `${color}12` }}
    >
      {children}
    </span>
  );
}

export function Bar({ value, max, color = '#E8C87A', className = '', height = 'h-1.5' }) {
  const p = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`overflow-hidden rounded-full bg-white/[0.08] ${height} ${className}`}>
      <div
        className="h-full rounded-full"
        style={{ width: `${p}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, transition: 'width .5s ease' }}
      />
    </div>
  );
}

export function RewardLine({ reward, t, lang }) {
  const items = [];
  if (reward?.gold) items.push({ icon: 'Coins', color: '#E8C87A', value: reward.gold });
  if (reward?.gems) items.push({ icon: 'Gem', color: '#8B7BF7', value: reward.gems });
  if (reward?.tickets) items.push({ icon: 'Ticket', color: '#6FE3C0', value: reward.tickets });
  if (reward?.exp) items.push({ icon: 'Sparkles', color: '#9B8CFF', value: reward.exp });
  if (reward?.shards) items.push({ icon: 'Layers', color: '#F0748F', value: `×${reward.shards}` });
  if (reward?.medals) items.push({ icon: 'Trophy', color: '#F0B85C', value: reward.medals });

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {items.map((it) => (
        <span key={it.icon} className="flex items-center gap-1 text-[10px] tabular-nums text-foreground/80">
          <GameIcon name={it.icon} className="h-3 w-3" style={{ color: it.color }} />
          {typeof it.value === 'number' ? it.value.toLocaleString('en-US') : it.value}
        </span>
      ))}
      {!items.length ? <span className="text-[10px] text-muted-foreground">{t?.('common.none')}</span> : null}
    </div>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <div className="mt-4 flex items-center gap-2 first:mt-0">
      <h4 className="text-[10px] tracking-[0.2em] text-foreground/80">{children}</h4>
      <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
      {right}
    </div>
  );
}