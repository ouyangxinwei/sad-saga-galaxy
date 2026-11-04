import { useNavigate } from 'react-router-dom';
import GameIcon from '@/components/common/GameIcon';
import { useGame } from '@/lib/GameContext';
import { pct } from '@/lib/format';

function Tile({ index, icon, title, desc, badge, onClick, locked, progress, tint }) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={!onClick && !locked}
      className={`tap group relative flex h-[124px] flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left sm:h-[136px] sm:p-3.5 ${
        locked
          ? 'cursor-default border-white/[0.06] bg-white/[0.015] opacity-60'
          : 'border-white/10 bg-white/[0.028] hover:border-primary/40 hover:bg-white/[0.05]'
      }`}
    >
      <div className="pointer-events-none absolute -right-1 -top-3 select-none saga-display text-[52px] leading-none text-white/[0.035]">
        {String(index).padStart(2, '0')}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(90% 100% at 50% 0%, ${tint}26, transparent 70%)` }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="rounded-xl border border-white/10 bg-black/25 p-1.5"
          style={{ boxShadow: locked ? 'none' : `inset 0 0 18px -8px ${tint}` }}
        >
          <GameIcon name={locked ? 'Lock' : icon} className="h-4 w-4" style={{ color: locked ? '#8b93a8' : tint }} />
        </span>
        {badge ? (
          <span
            className="rounded-full border px-1.5 py-0.5 text-[8px] tracking-wider"
            style={{ borderColor: `${tint}44`, color: tint, background: `${tint}12` }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <p className="text-[12.5px] font-medium tracking-wide text-foreground/92">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-snug text-muted-foreground">{desc}</p>
        {typeof progress === 'number' ? (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct(progress * 100, 100)}%`, background: `linear-gradient(90deg, ${tint}66, ${tint})` }}
            />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export default function MainMenuGrid({ onOpen }) {
  const { t, cleared, totalStages, bounties } = useGame();
  const navigate = useNavigate();
  const ready = (bounties?.list || []).filter((b) => b.endsAt && Date.now() >= b.endsAt).length;

  const tiles = [
    {
      icon: 'Map',
      tint: '#E8C87A',
      title: t('menu.main'),
      desc: t('menu.main_desc'),
      badge: `${cleared}/${totalStages}`,
      progress: cleared / totalStages,
      onClick: () => navigate('/stages'),
    },
    {
      icon: 'Flame',
      tint: '#F0748F',
      title: t('menu.event'),
      desc: t('menu.event_desc'),
      badge: 'LIVE',
      onClick: () => onOpen('event'),
    },
    {
      icon: 'Castle',
      tint: '#6FA8FF',
      title: t('menu.trials'),
      desc: t('menu.trials_desc'),
      onClick: () => onOpen('trials'),
    },
    {
      icon: 'Beer',
      tint: '#6FE3C0',
      title: t('menu.tavern'),
      desc: t('menu.tavern_desc'),
      badge: ready ? `${ready}` : null,
      onClick: () => onOpen('tavern'),
    },
    {
      icon: 'Trophy',
      tint: '#9B8CFF',
      title: t('menu.arena'),
      desc: t('menu.arena_desc'),
      badge: t('menu.todo'),
      locked: true,
    },
    {
      icon: 'Repeat',
      tint: '#72D9C2',
      title: t('resourceExchange.title'),
      desc: t('resourceExchange.subtitle'),
      badge: '1:2',
      onClick: () => navigate('/resource-exchange'),
    },
  ];

  return (
    <section className="saga-panel relative overflow-hidden p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] tracking-[0.2em] text-foreground/85">{t('menu.title').toUpperCase()}</h3>
        <div className="h-px flex-1 mx-3 bg-gradient-to-r from-primary/30 to-transparent" />
        <span className="text-[9px] tabular-nums text-muted-foreground">{t('menu.progress')} {Math.round((cleared / totalStages) * 100)}%</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
        {tiles.map((tile, i) => (
          <Tile key={tile.title} index={i + 1} {...tile} />
        ))}
      </div>
    </section>
  );
}