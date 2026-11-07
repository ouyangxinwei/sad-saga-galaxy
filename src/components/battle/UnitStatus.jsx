import SigilArt from '@/components/common/SigilArt';
import GameIcon from '@/components/common/GameIcon';
import { RARITY_COLOR } from '@/lib/gameData';
import { STATUS_DEFINITIONS, getStatusPresentation } from '@/lib/abnormalStatus';
import { fmt, pct } from '@/lib/format';

const DEFENSE_COPY = {
  zh: { resistance: '抗性', immune: '免疫' },
  ja: { resistance: '耐性', immune: '無効' },
  en: { resistance: 'Resist', immune: 'Immune' },
};
const STATUS_TYPES = ['poison', 'blind', 'paralysis', 'sleep', 'confusion'];

export default function UnitStatus({ unit, state, compact = false, lang = 'zh' }) {
  const st = state || {};
  const maxHp = st.maxHp || unit.maxHp || unit.hp;
  const hp = Math.max(0, st.hp ?? unit.hp ?? 0);
  const alive = st.alive !== false;
  const shield = st.shield || 0;
  const lp = st.lp ?? unit.lp ?? 0;
  const maxLp = unit.maxLp || 0;
  const color = RARITY_COLOR[unit.rarity] || '#8B93A8';
  const isAlly = unit.side === 'ally';
  const maxMp = unit.maxMp || 100;
  const mp = st.mp ?? unit.mp ?? 0;
  const activeStatuses = st.activeStatuses || unit.activeStatuses || [];
  const copy = DEFENSE_COPY[lang] || DEFENSE_COPY.en;
  const resistances = STATUS_TYPES.filter((type) => Number(unit.statusResistance?.[type]) > 0);
  const immunities = Array.isArray(unit.statusImmunities) ? unit.statusImmunities : [];

  return (
    <div className={`flex min-w-0 flex-col items-center ${alive ? '' : 'opacity-35 saturate-0'}`}>
      <div className={`relative w-full ${compact ? 'max-w-[76px]' : 'max-w-[92px]'}`}>
        <SigilArt
          def={{ rarity: unit.rarity, classId: unit.classId, converted: !isAlly, type: unit.type }}
          size={compact ? 'xs' : 'sm'}
          className={`w-full ${compact ? 'h-[66px]' : 'h-[78px]'} rounded-lg border ${isAlly ? 'border-primary/25' : 'border-rose-400/25'}`}
        >
          {shield > 0 && (
            <span className="absolute right-1 top-1 rounded bg-[#6FA8FF]/20 px-1 text-[8px] text-[#9CC4FF]">
              +{fmt(shield)}
            </span>
          )}
          {!alive && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[9px] tracking-widest text-rose-300/80">
              DOWN
            </span>
          )}
          <div className="absolute inset-x-1 bottom-1">
            <div className="h-1 overflow-hidden rounded-full bg-black/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct(hp, maxHp)}%`,
                  background: isAlly
                    ? 'linear-gradient(90deg,#3fbf9a,#8ef0cf)'
                    : 'linear-gradient(90deg,#b03a55,#f0798f)',
                  transition: 'width .35s ease',
                }}
              />
            </div>
            <div className="mt-0.5 h-[2px] overflow-hidden rounded-full bg-black/60">
              <div
                className="h-full rounded-full bg-[#6FA8FF]"
                style={{ width: `${pct(mp, maxMp)}%`, transition: 'width .35s ease' }}
              />
            </div>
          </div>
        </SigilArt>
      </div>
      <p className="mt-1 w-full truncate text-center text-[9.5px] text-foreground/85">{unit.name}</p>
      <p className="text-[8px] tabular-nums text-muted-foreground">
        {fmt(hp)} / {fmt(maxHp)}
      </p>
      {activeStatuses.length > 0 ? (
        <div className="mt-1 flex max-w-full flex-wrap justify-center gap-0.5">
          {activeStatuses.map((status) => {
            const presentation = getStatusPresentation(status, lang);
            if (!presentation) return null;
            return (
              <details key={status.type} className="relative">
                <summary
                  aria-label={presentation.ariaLabel}
                  title={presentation.ariaLabel}
                  className="cursor-pointer list-none rounded border border-rose-300/25 bg-rose-400/10 px-1 py-0.5 text-[7px] leading-none text-rose-200 [&::-webkit-details-marker]:hidden"
                >
                  {presentation.marker}
                </summary>
                <div role="note" className="absolute bottom-full left-1/2 z-50 mb-1 w-40 -translate-x-1/2 rounded-md border border-rose-200/30 bg-[#171b2b] p-2 text-left text-[10px] leading-snug text-rose-50 shadow-xl">
                  <div className="font-semibold">{presentation.label} · {presentation.remainingLabel}</div>
                  <p className="mt-1 text-rose-100/80">{presentation.description}</p>
                </div>
              </details>
            );
          })}
        </div>
      ) : null}
      {(resistances.length > 0 || immunities.length > 0) && (
        <div className="mt-1 flex max-w-full flex-wrap justify-center gap-0.5">
          {resistances.map((type) => {
            const definition = STATUS_DEFINITIONS[type];
            const value = Math.round(Number(unit.statusResistance[type]) * 100);
            return <span key={`resist-${type}`} role="img" aria-label={`${copy.resistance}: ${definition.label[lang] || definition.label.zh} ${value}%`} title={`${copy.resistance}: ${definition.label[lang] || definition.label.zh} ${value}%`} className="rounded border border-sky-300/25 bg-sky-400/10 px-1 py-0.5 text-[7px] leading-none text-sky-200">{definition.short[lang] || definition.short.zh} {value}%</span>;
          })}
          {immunities.map((type) => {
            const definition = STATUS_DEFINITIONS[type];
            if (!definition) return null;
            return <span key={`immune-${type}`} role="img" aria-label={`${copy.immune}: ${definition.label[lang] || definition.label.zh}`} title={`${copy.immune}: ${definition.label[lang] || definition.label.zh}`} className="rounded border border-amber-300/25 bg-amber-400/10 px-1 py-0.5 text-[7px] leading-none text-amber-200">{copy.immune} {definition.short[lang] || definition.short.zh}</span>;
          })}
        </div>
      )}
      {isAlly && maxLp > 0 && (
        <div className="mt-0.5 flex items-center gap-[2px]">
          {Array.from({ length: maxLp }, (_, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full"
              style={{ background: i < lp ? '#E8C87A' : 'rgba(255,255,255,0.14)' }}
            />
          ))}
        </div>
      )}
      {unit.taunt > 0 && (
        <span className="mt-0.5 flex items-center gap-0.5 text-[8px] text-[#F0B85C]">
          <GameIcon name="Shield" className="h-2 w-2" />
        </span>
      )}
    </div>
  );
}
