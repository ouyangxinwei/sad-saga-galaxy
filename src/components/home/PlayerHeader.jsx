import { useGame } from '@/lib/GameContext';
import { classOf, expNeed, levelCap } from '@/lib/gameData';
import { fmt, pct } from '@/lib/format';

function StatChip({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1.5">
      <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground/70">{label}</span>
      <span className="text-[12px] font-medium tabular-nums" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

export default function PlayerHeader() {
  const { t, lang, level, exp, rebirth, classId, power, totals, cleared } = useGame();
  const cap = levelCap(rebirth);
  const need = expNeed(level);
  const ringPct = pct(exp, need);
  const R = 26;
  const CIRC = 2 * Math.PI * R;
  const cls = classOf(classId);

  return (
    <section className="saga-panel relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className="relative h-[74px] w-[74px] shrink-0">
          <svg viewBox="0 0 74 74" className="absolute inset-0 -rotate-90">
            <defs>
              <linearGradient id="lvlGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f4e3b2" />
                <stop offset="55%" stopColor="#e8c87a" />
                <stop offset="100%" stopColor="#9a7434" />
              </linearGradient>
            </defs>
            <circle cx="37" cy="37" r={R} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="4" />
            <circle
              cx="37"
              cy="37"
              r={R}
              fill="none"
              stroke="url(#lvlGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - ringPct / 100)}
              style={{ transition: 'stroke-dashoffset .8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t('player.level')}</span>
            <span className="saga-display text-xl leading-none text-foreground">{level}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] tracking-wider text-primary">
              {cls.name[lang] || cls.name.zh}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
              {t('player.rebirth')} {rebirth}
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {t('common.max')} {cap}
            </span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-[9px] tracking-wider text-muted-foreground">
              <span>{t('player.exp')}</span>
              <span className="tabular-nums">
                {fmt(exp)} / {fmt(need)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9a7434] via-[#e8c87a] to-[#f6ebc9]"
                style={{ width: `${ringPct}%`, transition: 'width .8s ease' }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/70">{t('player.power')}</p>
              <p className="saga-display text-lg leading-none gold-text">{fmt(power)}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/70">{t('menu.progress')}</p>
              <p className="text-[11px] tabular-nums text-foreground/80">
                {cleared ?? 0}/300
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2">
        <StatChip label={t('player.hp')} value={fmt(totals.hp)} accent="#F0748F" />
        <StatChip label={t('player.mp')} value={fmt(totals.mp)} accent="#6FA8FF" />
        <StatChip label={t('player.lp')} value={totals.lp} accent="#E8C87A" />
      </div>
    </section>
  );
}