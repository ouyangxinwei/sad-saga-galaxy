import GameIcon from '@/components/common/GameIcon';
import { useGame } from '@/lib/GameContext';
import { LANGS } from '@/lib/i18n';
import { MILESTONES } from '@/lib/gameData';
import { todayKey } from '@/lib/save';
import { fmt } from '@/lib/format';
import { APP_VERSION } from '@/lib/version';

const ACTIONS = [
  { id: 'checkin', icon: 'Gift', key: 'top.checkin' },
  { id: 'milestone', icon: 'Trophy', key: 'top.milestone' },
  { id: 'summon', icon: 'Dices', key: 'top.summon' },
  { id: 'gallery', icon: 'Layers', key: 'top.gallery' },
  { id: 'idle', icon: 'Timer', key: 'top.idle' },
  { id: 'patches', icon: 'ScrollText', key: 'top.patches' },
  { id: 'shop', icon: 'Coins', key: 'top.shop' },
];

function ResourcePill({ icon, color, value, label, dot }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1">
      <GameIcon name={icon} className="h-3.5 w-3.5" style={{ color }} />
      <span className="text-[11px] font-medium tabular-nums text-foreground/90">{value}</span>
      <span className="hidden text-[9px] uppercase tracking-wider text-muted-foreground/70 sm:inline">{label}</span>
      {dot ? <span className="h-1 w-1 rounded-full bg-primary" /> : null}
    </div>
  );
}

export default function TopBar({ onOpen }) {
  const { t, lang, setLang, gold, gems, tickets, stamina, staminaMax, checkin, ownedHeroCount, enemyUnlocked, msClaimed } = useGame();

  const checkinReady = checkin.last !== todayKey();
  const msReady =
    MILESTONES.some((m) => !(msClaimed.heroes || []).includes(m.at) && ownedHeroCount >= m.at) ||
    MILESTONES.some((m) => !(msClaimed.enemies || []).includes(m.at) && enemyUnlocked >= m.at);

  const dots = { checkin: checkinReady, milestone: msReady };

  return (
    <header className="saga-panel relative overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
      <div className="pointer-events-none absolute -right-12 -top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-primary/30 spin-slow" />
            <span className="absolute inset-1.5 rounded-full border border-dashed border-accent/40 spin-slower" />
            <GameIcon name="Star" className="relative h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h1 className="saga-display gold-text text-[17px] leading-none sm:text-[22px]">{t('brand')}</h1>
            <p className="mt-1 text-[8px] uppercase tracking-[0.28em] text-muted-foreground/70 sm:text-[9px]">{t('brand_sub')}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-0.5">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={`tap rounded-full px-2 py-1 text-[10px] tracking-wide ${
                lang === l.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          <ResourcePill icon="Coins" color="#E8C87A" value={fmt(gold)} label={t('res.gold')} />
          <ResourcePill icon="Gem" color="#8B7BF7" value={fmt(gems)} label={t('res.gems')} />
          <ResourcePill icon="Ticket" color="#6FE3C0" value={fmt(tickets)} label={t('res.tickets')} />
          <ResourcePill icon="BatteryFull" color="#F0748F" value={`${stamina}/${staminaMax}`} label={t('res.stamina')} />
        </div>
        <div className="no-scrollbar flex items-center justify-between gap-0.5 overflow-x-auto">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onOpen?.(a.id)}
              className="tap relative flex w-[46px] shrink-0 flex-col items-center gap-1 rounded-xl px-0.5 py-1 hover:bg-white/[0.06] sm:w-[52px]"
            >
              <GameIcon name={a.icon} className="h-[15px] w-[15px] text-foreground/75" />
              <span className="whitespace-nowrap text-[8.5px] tracking-wide text-muted-foreground">{t(a.key)}</span>
              {a.id === 'patches' ? <span className="text-[7px] leading-none tracking-wide text-primary/80">{APP_VERSION}</span> : null}
              {dots[a.id] ? (
                <span className="absolute right-1.5 top-0.5 h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_7px_rgba(251,113,133,0.95)]" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}